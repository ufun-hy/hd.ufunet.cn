(function (window, $) {
    'use strict';

    var videoExtensions = /\.(mp4|webm|ogg|ogv|mov|m4v|mpeg|mpg|mpe|m2v|flv|wmv|avi|3gp|3g2|rv|mkv|m3u8)(?:[?#].*)?$/i;

    function isVideo(url) {
        return !!url && videoExtensions.test(String(url).trim());
    }

    function getSource(element) {
        return $(element).attr('data-vote-media') || $(element).attr('data-src') || '';
    }

    function getPoster(element) {
        return $(element).attr('data-vote-poster') || '';
    }

    function getMode(element, options) {
        return $(element).attr('data-vote-media-mode') || (options && options.mode) || 'preview';
    }

    function copyMediaAttributes(from, to) {
        var $from = $(from);
        var className = $from.attr('class');
        var style = $from.attr('style');

        if (className) {
            $(to).attr('class', className);
        }
        if (style) {
            $(to).attr('style', style);
        }
    }

    function createVideo(source, mode) {
        var isCover = mode === 'cover';
        return $('<video>', {
            src: source,
            playsinline: true,
            preload: isCover ? 'auto' : 'metadata',
            'webkit-playsinline': true
        }).prop('controls', !isCover).prop('muted', isCover).attr('aria-hidden', isCover ? 'true' : null).attr('tabindex', isCover ? '-1' : null);
    }

    function createPoster(poster) {
        return $('<img>', {
            src: poster,
            alt: ''
        });
    }

    function render(element, options) {
        var $element = $(element);
        var source = getSource(element);
        var poster = getPoster(element);
        var mode = getMode(element, options);
        var renderKey = source + '::' + mode + '::' + poster;

        if (!source) {
            $element.addClass('display-none').empty().removeData('vote-media-rendered');
            return;
        }

        $element.removeClass('display-none');
        if ($element.data('vote-media-rendered') === renderKey) {
            return;
        }

        var media;
        if (isVideo(source)) {
            media = mode === 'cover' && poster && !isVideo(poster)
                ? createPoster(poster)
                : createVideo(source, mode);
        } else {
            media = $('<img>', {
                src: source,
                alt: ''
            });
        }

        copyMediaAttributes(element, media);
        media.removeAttr('data-vote-media').removeAttr('data-src').removeAttr('data-vote-poster');
        $element.empty().append(media).data('vote-media-rendered', renderKey);
    }

    function upgradeLegacyImages(root, options) {
        var $root = root ? $(root) : $(document);
        $root.find('img').addBack('img').each(function () {
            var $image = $(this);
            var source = $image.attr('src') || '';
            if (!isVideo(source)) {
                return;
            }

            var video = createVideo(source, (options && options.mode) || 'preview');
            copyMediaAttributes(this, video);
            $image.replaceWith(video);
        });
    }

    function renderAll(root, options) {
        var $root = root ? $(root) : $(document);
        $root.find('[data-vote-media]').addBack('[data-vote-media]').each(function () {
            render(this, options);
        });
        upgradeLegacyImages($root, options);
    }

    window.voteMedia = {
        isVideo: isVideo,
        render: render,
        renderAll: renderAll,
        upgradeLegacyImages: upgradeLegacyImages
    };
})(window, window.jQuery);
