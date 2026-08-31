#!/usr/bin/env bash

set -Eeuo pipefail

usage() {
    cat <<'EOF'
Usage:
  scripts/deploy-production.sh --commit <full-commit-sha> --target-dir <production-root> \
    --file <tracked-path> [--file <tracked-path> ...] [--dry-run | --apply]

Options:
  --commit SHA       Exact 40-character commit SHA from main.
  --target-dir DIR  Production root directory available on this host.
  --file PATH        Tracked file to deploy. Repeat for every file.
  --dry-run          Do not copy or create backups; verify current target files.
  --apply            Backup and copy the specified files, then verify SHA256.
EOF
}

repo_root=""
target_dir=""
backup_root=""
backup_dir=""
source_commit=""
commit_arg=""
target_arg=""
mode=""
hash_tool=""
stage_dir=""
match_count=0
result="FAIL"
summary_printed=0
files=()

print_summary() {
    if [[ "$summary_printed" -eq 1 ]]; then
        return
    fi
    summary_printed=1

    printf 'Source commit: %s\n' "${source_commit:--}"
    printf 'Deployment files:\n'
    if [[ "${#files[@]}" -eq 0 ]]; then
        printf '  -\n'
    else
        for file in "${files[@]}"; do
            printf '  - %s\n' "$file"
        done
    fi
    printf 'Backup dir: %s\n' "${backup_dir:--}"
    printf 'SHA match count: %s/%s\n' "$match_count" "${#files[@]}"
    printf 'Result: %s\n' "$result"
}

cleanup() {
    if [[ -n "$stage_dir" && -d "$stage_dir" ]]; then
        rm -rf "$stage_dir"
    fi
}

abort() {
    printf 'ERROR: %s\n' "$1" >&2
    exit 1
}

on_exit() {
    exit_status=$?
    if [[ "$exit_status" -ne 0 ]]; then
        result="FAIL"
    fi
    print_summary
    cleanup
    exit "$exit_status"
}

sha256_stream() {
    if [[ "$hash_tool" == "sha256sum" ]]; then
        sha256sum | awk '{print $1}'
    else
        shasum -a 256 | awk '{print $1}'
    fi
}

sha256_file() {
    if [[ "$hash_tool" == "sha256sum" ]]; then
        sha256sum "$1" | awk '{print $1}'
    else
        shasum -a 256 "$1" | awk '{print $1}'
    fi
}

check_tracked_worktree_clean() {
    tracked_status="$(git -C "$repo_root" status --porcelain=v1 --untracked-files=no)"
    [[ -z "$tracked_status" ]] || abort "tracked working tree is not clean"
}

if [[ "$#" -eq 0 ]]; then
    usage >&2
    exit 2
fi

while [[ "$#" -gt 0 ]]; do
    case "$1" in
        --commit)
            [[ "$#" -ge 2 ]] || { usage >&2; exit 2; }
            commit_arg="$2"
            shift 2
            ;;
        --target-dir)
            [[ "$#" -ge 2 ]] || { usage >&2; exit 2; }
            target_arg="$2"
            shift 2
            ;;
        --file)
            [[ "$#" -ge 2 ]] || { usage >&2; exit 2; }
            files+=("$2")
            shift 2
            ;;
        --dry-run)
            [[ -z "$mode" ]] || { usage >&2; exit 2; }
            mode="dry-run"
            shift
            ;;
        --apply)
            [[ -z "$mode" ]] || { usage >&2; exit 2; }
            mode="apply"
            shift
            ;;
        --help|-h)
            usage
            exit 0
            ;;
        *)
            usage >&2
            exit 2
            ;;
    esac
done

[[ -n "$commit_arg" ]] || { usage >&2; exit 2; }
[[ -n "$target_arg" ]] || { usage >&2; exit 2; }
[[ "${#files[@]}" -gt 0 ]] || { usage >&2; exit 2; }
mode="${mode:-dry-run}"

script_dir="$(CDPATH= cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd -P)"
repo_root="$(git -C "$script_dir/.." rev-parse --show-toplevel 2>/dev/null)" || abort "script must be inside a Git repository"

trap on_exit EXIT

if [[ "$target_arg" == /* ]]; then
    target_dir="$target_arg"
else
    target_dir="$PWD/$target_arg"
fi
target_dir="$(CDPATH= cd -- "$target_dir" 2>/dev/null && pwd -P)" || abort "target directory does not exist: $target_arg"
backup_root="$target_dir/runtime/deploy-backups"
[[ -d "$backup_root" ]] || abort "backup directory does not exist: $backup_root"

current_branch="$(git -C "$repo_root" symbolic-ref --short -q HEAD 2>/dev/null || true)"
[[ "$current_branch" == "main" ]] || abort "current branch must be main"
check_tracked_worktree_clean

[[ "$commit_arg" =~ ^[0-9a-fA-F]{40}$ ]] || abort "--commit must be an exact 40-character commit SHA"
requested_commit="$(printf '%s' "$commit_arg" | tr '[:upper:]' '[:lower:]')"
source_commit="$(git -C "$repo_root" rev-parse --verify "$requested_commit^{commit}" 2>/dev/null)" || abort "commit does not resolve to a commit: $commit_arg"
[[ "$source_commit" == "$requested_commit" ]] || abort "commit must be the exact resolved SHA: $commit_arg"
git -C "$repo_root" merge-base --is-ancestor "$source_commit" refs/heads/main || abort "commit is not reachable from main: $source_commit"

if command -v sha256sum >/dev/null 2>&1; then
    hash_tool="sha256sum"
elif command -v shasum >/dev/null 2>&1; then
    hash_tool="shasum"
else
    abort "sha256sum or shasum is required"
fi

for file in "${files[@]}"; do
    [[ -n "$file" ]] || abort "file path must not be empty"
    case "$file" in
        /*|.|..|./*|../*|*/../*|*/./*|*//* )
            abort "file path must be a normalized repository-relative path: $file"
            ;;
    esac

    object="${source_commit}:$file"
    object_type="$(git -C "$repo_root" cat-file -t "$object" 2>/dev/null || true)"
    [[ "$object_type" == "blob" ]] || abort "file is not a tracked file at commit $source_commit: $file"
done

# ponytail: O(n²) duplicate check; deployment lists are intentionally small.
for ((file_index = 0; file_index < ${#files[@]}; file_index++)); do
    for ((other_index = file_index + 1; other_index < ${#files[@]}; other_index++)); do
        [[ "${files[$file_index]}" != "${files[$other_index]}" ]] || abort "duplicate deployment file: ${files[$file_index]}"
    done
done

stage_dir="$(mktemp -d "${TMPDIR:-/tmp}/hd-ufun-deploy.XXXXXX")" || abort "cannot create temporary staging directory"
git -C "$repo_root" archive --format=tar "$source_commit" -- "${files[@]}" | tar -xf - -C "$stage_dir" || abort "cannot stage files from commit $source_commit"

for file in "${files[@]}"; do
    [[ -f "$stage_dir/$file" ]] || abort "staged source file is missing: $file"
    target_path="$target_dir/$file"
    [[ ! -L "$target_path" ]] || abort "production target must not be a symlink: $file"
    if [[ -e "$target_path" && ! -f "$target_path" ]]; then
        abort "production target is not a regular file: $file"
    fi
done

backup_dir="$backup_root/$(date -u '+%Y%m%dT%H%M%SZ')-$source_commit"

if [[ "$mode" == "apply" ]]; then
    check_tracked_worktree_clean
    [[ ! -e "$backup_dir" ]] || abort "backup directory already exists: $backup_dir"
    mkdir -p "$backup_dir" || abort "cannot create backup directory: $backup_dir"

    for file in "${files[@]}"; do
        target_path="$target_dir/$file"
        backup_path="$backup_dir/$file"
        if [[ -e "$target_path" ]]; then
            mkdir -p "$(dirname "$backup_path")" || abort "cannot create backup parent: $file"
            cp -p "$target_path" "$backup_path" || abort "cannot back up production file: $file"
        fi
        mkdir -p "$(dirname "$target_path")" || abort "cannot create production parent: $file"
        cp -p "$stage_dir/$file" "$target_path" || abort "cannot deploy file: $file"
    done
fi

for file in "${files[@]}"; do
    source_sha="$(git -C "$repo_root" show "$source_commit:$file" | sha256_stream)" || abort "cannot hash Git source file: $file"
    target_path="$target_dir/$file"
    if [[ -f "$target_path" ]]; then
        production_sha="$(sha256_file "$target_path")" || abort "cannot hash production file: $file"
    else
        production_sha="MISSING"
    fi

    if [[ "$source_sha" == "$production_sha" ]]; then
        match_count=$((match_count + 1))
    else
        printf 'SHA mismatch: %s (source=%s production=%s)\n' "$file" "$source_sha" "$production_sha" >&2
    fi
done

if [[ "$match_count" -eq "${#files[@]}" ]]; then
    result="PASS"
    exit 0
fi

result="FAIL"
exit 1
