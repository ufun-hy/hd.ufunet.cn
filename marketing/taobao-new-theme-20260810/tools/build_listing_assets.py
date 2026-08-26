from __future__ import annotations

from dataclasses import dataclass
from pathlib import Path

from PIL import Image, ImageDraw, ImageEnhance, ImageFilter, ImageFont


ROOT = Path(__file__).resolve().parents[1]
SOURCE = ROOT / "source-frames"
EXPORTS = ROOT / "exports"
FONT_PATH = "/System/Library/Fonts/Hiragino Sans GB.ttc"
SIZE = 1024


@dataclass(frozen=True)
class Palette:
    ink: tuple[int, int, int] = (10, 5, 35)
    purple: tuple[int, int, int] = (42, 13, 111)
    violet: tuple[int, int, int] = (118, 42, 255)
    cyan: tuple[int, int, int] = (40, 220, 255)
    white: tuple[int, int, int] = (255, 255, 255)
    muted: tuple[int, int, int] = (204, 197, 232)


P = Palette()


def font(size: int, *, index: int = 0) -> ImageFont.FreeTypeFont:
    return ImageFont.truetype(FONT_PATH, size=size, index=index)


def vertical_gradient(top: tuple[int, int, int], bottom: tuple[int, int, int]) -> Image.Image:
    canvas = Image.new("RGB", (SIZE, SIZE), top)
    px = canvas.load()
    for y in range(SIZE):
        t = y / (SIZE - 1)
        color = tuple(round(a * (1 - t) + b * t) for a, b in zip(top, bottom))
        for x in range(SIZE):
            px[x, y] = color
    return canvas


def polished_source(name: str) -> Image.Image:
    image = Image.open(SOURCE / name).convert("RGB")
    image = ImageEnhance.Color(image).enhance(1.08)
    image = ImageEnhance.Contrast(image).enhance(1.07)
    image = ImageEnhance.Sharpness(image).enhance(1.25)
    return image


def cover(image: Image.Image, size: tuple[int, int], center: tuple[float, float] = (0.5, 0.5)) -> Image.Image:
    target_w, target_h = size
    scale = max(target_w / image.width, target_h / image.height)
    resized = image.resize((round(image.width * scale), round(image.height * scale)), Image.Resampling.LANCZOS)
    cx = round((resized.width - target_w) * center[0])
    cy = round((resized.height - target_h) * center[1])
    return resized.crop((cx, cy, cx + target_w, cy + target_h))


def rounded_image(image: Image.Image, size: tuple[int, int], radius: int) -> Image.Image:
    image = cover(image, size)
    mask = Image.new("L", size, 0)
    ImageDraw.Draw(mask).rounded_rectangle((0, 0, size[0] - 1, size[1] - 1), radius=radius, fill=255)
    out = Image.new("RGBA", size, (0, 0, 0, 0))
    out.paste(image, (0, 0), mask)
    return out


def glow_rect(canvas: Image.Image, box: tuple[int, int, int, int], radius: int = 30) -> None:
    x0, y0, x1, y1 = box
    glow = Image.new("RGBA", canvas.size, (0, 0, 0, 0))
    draw = ImageDraw.Draw(glow)
    for width, alpha in ((36, 35), (20, 55), (6, 130)):
        draw.rounded_rectangle((x0, y0, x1, y1), radius=radius, outline=(*P.cyan, alpha), width=width)
    glow = glow.filter(ImageFilter.GaussianBlur(18))
    canvas.alpha_composite(glow)


def pill(draw: ImageDraw.ImageDraw, xy: tuple[int, int], text: str, *, accent: tuple[int, int, int]) -> int:
    x, y = xy
    f = font(28)
    bounds = draw.textbbox((0, 0), text, font=f)
    width = bounds[2] - bounds[0] + 54
    draw.rounded_rectangle((x, y, x + width, y + 54), radius=27, fill=(*accent, 55), outline=(*accent, 150), width=2)
    draw.text((x + 27, y + 9), text, font=f, fill=P.white)
    return width


def add_top_scrim(canvas: Image.Image, height: int = 290) -> None:
    scrim = Image.new("RGBA", canvas.size, (0, 0, 0, 0))
    px = scrim.load()
    for y in range(height):
        alpha = round(220 * (1 - y / height) ** 1.7)
        for x in range(SIZE):
            px[x, y] = (7, 3, 28, alpha)
    canvas.alpha_composite(scrim)


def add_solid_header(canvas: Image.Image, height: int = 245) -> None:
    panel = Image.new("RGBA", canvas.size, (0, 0, 0, 0))
    pd = ImageDraw.Draw(panel)
    pd.rectangle((0, 0, SIZE, height), fill=(8, 3, 32, 238))
    pd.rectangle((0, height - 3, SIZE, height), fill=(*P.cyan, 150))
    canvas.alpha_composite(panel)


def save(image: Image.Image, filename: str) -> None:
    EXPORTS.mkdir(parents=True, exist_ok=True)
    image.convert("RGB").save(EXPORTS / filename, "JPEG", quality=95, subsampling=0, optimize=True)


def build_cover() -> None:
    canvas = vertical_gradient(P.ink, P.purple).convert("RGBA")
    orb = Image.new("RGBA", canvas.size, (0, 0, 0, 0))
    od = ImageDraw.Draw(orb)
    od.ellipse((580, -170, 1120, 370), fill=(*P.violet, 90))
    od.ellipse((-250, 610, 260, 1120), fill=(*P.cyan, 42))
    canvas.alpha_composite(orb.filter(ImageFilter.GaussianBlur(110)))

    draw = ImageDraw.Draw(canvas)
    draw.text((64, 62), "星环滚动抽奖", font=font(92), fill=P.white, stroke_width=2, stroke_fill=(65, 23, 145))
    draw.text((68, 180), "名单随机滚动 · 大屏现场揭晓", font=font(37), fill=P.muted)
    x = 68
    for label, color in (("星环主题", P.cyan), ("名单抽奖", P.violet), ("年会活动", (255, 125, 65))):
        x += pill(draw, (x, 252), label, accent=color) + 16

    frame = rounded_image(polished_source("bubble-spin-2560.jpg"), (920, 518), 28)
    glow_rect(canvas, (51, 365, 973, 885), radius=30)
    canvas.alpha_composite(frame, (52, 366))
    draw = ImageDraw.Draw(canvas)
    draw.rounded_rectangle((52, 906, 972, 970), radius=22, fill=(26, 12, 71, 255), outline=(88, 222, 255, 110), width=2)
    draw.text((82, 922), "前端大屏主题", font=font(29), fill=P.white)
    draw.text((746, 922), "真实动态效果", font=font(29), fill=P.cyan)
    save(canvas, "01-cover-bubble-lottery-1024.jpg")


def build_motion() -> None:
    source = polished_source("bubble-spin-2560.jpg")
    canvas = cover(source, (SIZE, SIZE), center=(0.5, 0.53)).convert("RGBA")
    add_top_scrim(canvas, 330)
    draw = ImageDraw.Draw(canvas)
    draw.text((56, 56), "星环随机滚动", font=font(70), fill=P.white, stroke_width=2, stroke_fill=(39, 8, 97))
    draw.text((60, 151), "名单在大屏中动态聚合 · 中心锁定结果", font=font(32), fill=(224, 218, 244))
    pill(draw, (60, 216), "前端抽奖画面", accent=P.cyan)
    save(canvas, "02-bubble-motion-1024.jpg")


def anonymized_winner_screen() -> Image.Image:
    image = polished_source("winner-list-2560.jpg")
    draw = ImageDraw.Draw(image, "RGBA")
    positions = [180, 690, 1200, 1710, 2200]
    labels = [
        ("市场营销部", "幸运用户01"),
        ("新业务部", "幸运用户02"),
        ("财务管理部", "幸运用户03"),
        ("运营支持部", "幸运用户04"),
        ("产品服务部", "幸运用户05"),
    ]
    for x, (department, person) in zip(positions, labels):
        for y in (630, 815):
            draw.rounded_rectangle((x - 18, y - 18, x + 310, y + 108), radius=20, fill=(39, 9, 105, 245))
            draw.text((x, y), department, font=font(30), fill=(255, 244, 201, 255))
            draw.text((x + 25, y + 48), person, font=font(27), fill=(255, 255, 255, 255))
    return image


def build_winners() -> None:
    source = anonymized_winner_screen()
    canvas = cover(source, (SIZE, SIZE), center=(0.5, 0.5)).convert("RGBA")
    add_solid_header(canvas, 232)
    draw = ImageDraw.Draw(canvas)
    draw.text((56, 42), "抽中结果集中展示", font=font(66), fill=P.white)
    draw.text((60, 133), "多人名单清晰排列 · 大屏一眼看全", font=font(32), fill=(230, 220, 249))
    save(canvas, "03-winner-display-1024.jpg")


def build_prize() -> None:
    source = polished_source("prize-result-2560.jpg")
    canvas = cover(source, (SIZE, SIZE), center=(0.5, 0.5)).convert("RGBA")
    add_solid_header(canvas, 232)
    draw = ImageDraw.Draw(canvas)
    draw.text((56, 42), "奖项结果清晰呈现", font=font(66), fill=P.white)
    draw.text((60, 133), "奖项 · 奖品 · 幸运名单同屏展示", font=font(32), fill=(233, 224, 250))
    save(canvas, "04-prize-result-1024.jpg")


def main() -> None:
    build_cover()
    build_motion()
    build_winners()
    build_prize()
    for path in sorted(EXPORTS.glob("*.jpg")):
        print(path)


if __name__ == "__main__":
    main()
