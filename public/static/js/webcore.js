define('webcore', ['require', 'jquery', 'layer', 'laytpl', 'swiper', (XCV3Config.amconfig.type == '1' ? 'directoss' : (XCV3Config.amconfig.type == '2' ? 'directcos' : (XCV3Config.amconfig.type == '3' ? 'directqiniu' : 'template')))], function (require, $, layer, laytpl, Swiper, directup) {
	var webcore = {
		fontarr: ["mdi mdi-access-point", "mdi mdi-access-point-network", "mdi mdi-account", "mdi mdi-account-alert", "mdi mdi-account-box", "mdi mdi-account-box-outline", "mdi mdi-account-card-details", "mdi mdi-account-check", "mdi mdi-account-circle", "mdi mdi-account-convert", "mdi mdi-account-edit", "mdi mdi-account-key", "mdi mdi-account-location", "mdi mdi-account-minus", "mdi mdi-account-multiple", "mdi mdi-account-multiple-minus", "mdi mdi-account-multiple-outline", "mdi mdi-account-multiple-plus", "mdi mdi-account-network", "mdi mdi-account-off", "mdi mdi-account-outline", "mdi mdi-account-plus", "mdi mdi-account-remove", "mdi mdi-account-search", "mdi mdi-account-settings", "mdi mdi-account-settings-variant", "mdi mdi-account-star", "mdi mdi-account-switch", "mdi mdi-adjust", "mdi mdi-air-conditioner", "mdi mdi-airballoon", "mdi mdi-airplane", "mdi mdi-airplane-landing", "mdi mdi-airplane-off", "mdi mdi-airplane-takeoff", "mdi mdi-airplay", "mdi mdi-alarm", "mdi mdi-alarm-bell", "mdi mdi-alarm-check", "mdi mdi-alarm-light", "mdi mdi-alarm-multiple", "mdi mdi-alarm-off", "mdi mdi-alarm-plus", "mdi mdi-alarm-snooze", "mdi mdi-album", "mdi mdi-alert", "mdi mdi-alert-box", "mdi mdi-alert-circle", "mdi mdi-alert-circle-outline", "mdi mdi-alert-decagram", "mdi mdi-alert-octagon", "mdi mdi-alert-octagram", "mdi mdi-alert-outline", "mdi mdi-all-inclusive", "mdi mdi-alpha", "mdi mdi-alphabetical", "mdi mdi-altimeter", "mdi mdi-amazon", "mdi mdi-amazon-clouddrive", "mdi mdi-ambulance", "mdi mdi-amplifier", "mdi mdi-anchor", "mdi mdi-android", "mdi mdi-android-debug-bridge", "mdi mdi-android-head", "mdi mdi-android-studio", "mdi mdi-angular", "mdi mdi-angularjs", "mdi mdi-animation", "mdi mdi-apple", "mdi mdi-apple-finder", "mdi mdi-apple-ios", "mdi mdi-apple-keyboard-caps", "mdi mdi-apple-keyboard-command", "mdi mdi-apple-keyboard-control", "mdi mdi-apple-keyboard-option", "mdi mdi-apple-keyboard-shift", "mdi mdi-apple-mobileme", "mdi mdi-apple-safari", "mdi mdi-application", "mdi mdi-approval", "mdi mdi-apps", "mdi mdi-archive", "mdi mdi-arrange-bring-forward", "mdi mdi-arrange-bring-to-front", "mdi mdi-arrange-send-backward", "mdi mdi-arrange-send-to-back", "mdi mdi-arrow-all", "mdi mdi-arrow-bottom-left", "mdi mdi-arrow-bottom-right", "mdi mdi-arrow-collapse", "mdi mdi-arrow-collapse-all", "mdi mdi-arrow-collapse-down", "mdi mdi-arrow-collapse-left", "mdi mdi-arrow-collapse-right", "mdi mdi-arrow-collapse-up", "mdi mdi-arrow-down", "mdi mdi-arrow-down-bold", "mdi mdi-arrow-down-bold-box", "mdi mdi-arrow-down-bold-box-outline", "mdi mdi-arrow-down-bold-circle", "mdi mdi-arrow-down-bold-circle-outline", "mdi mdi-arrow-down-bold-hexagon-outline", "mdi mdi-arrow-down-box", "mdi mdi-arrow-down-drop-circle", "mdi mdi-arrow-down-drop-circle-outline", "mdi mdi-arrow-down-thick", "mdi mdi-arrow-expand", "mdi mdi-arrow-expand-all", "mdi mdi-arrow-expand-down", "mdi mdi-arrow-expand-left", "mdi mdi-arrow-expand-right", "mdi mdi-arrow-expand-up", "mdi mdi-arrow-left", "mdi mdi-arrow-left-bold", "mdi mdi-arrow-left-bold-box", "mdi mdi-arrow-left-bold-box-outline", "mdi mdi-arrow-left-bold-circle", "mdi mdi-arrow-left-bold-circle-outline", "mdi mdi-arrow-left-bold-hexagon-outline", "mdi mdi-arrow-left-box", "mdi mdi-arrow-left-drop-circle", "mdi mdi-arrow-left-drop-circle-outline", "mdi mdi-arrow-left-thick", "mdi mdi-arrow-right", "mdi mdi-arrow-right-bold", "mdi mdi-arrow-right-bold-box", "mdi mdi-arrow-right-bold-box-outline", "mdi mdi-arrow-right-bold-circle", "mdi mdi-arrow-right-bold-circle-outline", "mdi mdi-arrow-right-bold-hexagon-outline", "mdi mdi-arrow-right-box", "mdi mdi-arrow-right-drop-circle", "mdi mdi-arrow-right-drop-circle-outline", "mdi mdi-arrow-right-thick", "mdi mdi-arrow-top-left", "mdi mdi-arrow-top-right", "mdi mdi-arrow-up", "mdi mdi-arrow-up-bold", "mdi mdi-arrow-up-bold-box", "mdi mdi-arrow-up-bold-box-outline", "mdi mdi-arrow-up-bold-circle", "mdi mdi-arrow-up-bold-circle-outline", "mdi mdi-arrow-up-bold-hexagon-outline", "mdi mdi-arrow-up-box", "mdi mdi-arrow-up-drop-circle", "mdi mdi-arrow-up-drop-circle-outline", "mdi mdi-arrow-up-thick", "mdi mdi-assistant", "mdi mdi-asterisk", "mdi mdi-at", "mdi mdi-atom", "mdi mdi-attachment", "mdi mdi-audiobook", "mdi mdi-auto-fix", "mdi mdi-auto-upload", "mdi mdi-autorenew", "mdi mdi-av-timer", "mdi mdi-baby", "mdi mdi-baby-buggy", "mdi mdi-backburger", "mdi mdi-backspace", "mdi mdi-backup-restore", "mdi mdi-bandcamp", "mdi mdi-bank", "mdi mdi-barcode", "mdi mdi-barcode-scan", "mdi mdi-barley", "mdi mdi-barrel", "mdi mdi-basecamp", "mdi mdi-basket", "mdi mdi-basket-fill", "mdi mdi-basket-unfill", "mdi mdi-battery", "mdi mdi-battery-10", "mdi mdi-battery-20", "mdi mdi-battery-30", "mdi mdi-battery-40", "mdi mdi-battery-50", "mdi mdi-battery-60", "mdi mdi-battery-70", "mdi mdi-battery-80", "mdi mdi-battery-90", "mdi mdi-battery-alert", "mdi mdi-battery-charging", "mdi mdi-battery-charging-100", "mdi mdi-battery-charging-20", "mdi mdi-battery-charging-30", "mdi mdi-battery-charging-40", "mdi mdi-battery-charging-60", "mdi mdi-battery-charging-80", "mdi mdi-battery-charging-90", "mdi mdi-battery-minus", "mdi mdi-battery-negative", "mdi mdi-battery-outline", "mdi mdi-battery-plus", "mdi mdi-battery-positive", "mdi mdi-battery-unknown", "mdi mdi-beach", "mdi mdi-beaker", "mdi mdi-beats", "mdi mdi-beer", "mdi mdi-behance", "mdi mdi-bell", "mdi mdi-bell-off", "mdi mdi-bell-outline", "mdi mdi-bell-plus", "mdi mdi-bell-ring", "mdi mdi-bell-ring-outline", "mdi mdi-bell-sleep", "mdi mdi-beta", "mdi mdi-bible", "mdi mdi-bike", "mdi mdi-bing", "mdi mdi-binoculars", "mdi mdi-bio", "mdi mdi-biohazard", "mdi mdi-bitbucket", "mdi mdi-black-mesa", "mdi mdi-blackberry", "mdi mdi-blender", "mdi mdi-blinds", "mdi mdi-block-helper", "mdi mdi-blogger", "mdi mdi-bluetooth", "mdi mdi-bluetooth-audio", "mdi mdi-bluetooth-connect", "mdi mdi-bluetooth-off", "mdi mdi-bluetooth-settings", "mdi mdi-bluetooth-transfer", "mdi mdi-blur", "mdi mdi-blur-linear", "mdi mdi-blur-off", "mdi mdi-blur-radial", "mdi mdi-bomb", "mdi mdi-bomb-off", "mdi mdi-bone", "mdi mdi-book", "mdi mdi-book-minus", "mdi mdi-book-multiple", "mdi mdi-book-multiple-variant", "mdi mdi-book-open", "mdi mdi-book-open-page-variant", "mdi mdi-book-open-variant", "mdi mdi-book-plus", "mdi mdi-book-secure", "mdi mdi-book-unsecure", "mdi mdi-book-variant", "mdi mdi-bookmark", "mdi mdi-bookmark-check", "mdi mdi-bookmark-music", "mdi mdi-bookmark-outline", "mdi mdi-bookmark-plus", "mdi mdi-bookmark-plus-outline", "mdi mdi-bookmark-remove", "mdi mdi-boombox", "mdi mdi-bootstrap", "mdi mdi-border-all", "mdi mdi-border-bottom", "mdi mdi-border-color", "mdi mdi-border-horizontal", "mdi mdi-border-inside", "mdi mdi-border-left", "mdi mdi-border-none", "mdi mdi-border-outside", "mdi mdi-border-right", "mdi mdi-border-style", "mdi mdi-border-top", "mdi mdi-border-vertical", "mdi mdi-bow-tie", "mdi mdi-bowl", "mdi mdi-bowling", "mdi mdi-box", "mdi mdi-box-cutter", "mdi mdi-box-shadow", "mdi mdi-bridge", "mdi mdi-briefcase", "mdi mdi-briefcase-check", "mdi mdi-briefcase-download", "mdi mdi-briefcase-upload", "mdi mdi-brightness-1", "mdi mdi-brightness-2", "mdi mdi-brightness-3", "mdi mdi-brightness-4", "mdi mdi-brightness-5", "mdi mdi-brightness-6", "mdi mdi-brightness-7", "mdi mdi-brightness-auto", "mdi mdi-broom", "mdi mdi-brush", "mdi mdi-buffer", "mdi mdi-bug", "mdi mdi-bulletin-board", "mdi mdi-bullhorn", "mdi mdi-bullseye", "mdi mdi-burst-mode", "mdi mdi-bus", "mdi mdi-bus-articulated-end", "mdi mdi-bus-articulated-front", "mdi mdi-bus-double-decker", "mdi mdi-bus-school", "mdi mdi-bus-side", "mdi mdi-cached", "mdi mdi-cake", "mdi mdi-cake-layered", "mdi mdi-cake-variant", "mdi mdi-calculator", "mdi mdi-calendar", "mdi mdi-calendar-blank", "mdi mdi-calendar-check", "mdi mdi-calendar-clock", "mdi mdi-calendar-multiple", "mdi mdi-calendar-multiple-check", "mdi mdi-calendar-plus", "mdi mdi-calendar-question", "mdi mdi-calendar-range", "mdi mdi-calendar-remove", "mdi mdi-calendar-text", "mdi mdi-calendar-today", "mdi mdi-call-made", "mdi mdi-call-merge", "mdi mdi-call-missed", "mdi mdi-call-received", "mdi mdi-call-split", "mdi mdi-camcorder", "mdi mdi-camcorder-box", "mdi mdi-camcorder-box-off", "mdi mdi-camcorder-off", "mdi mdi-camera", "mdi mdi-camera-burst", "mdi mdi-camera-enhance", "mdi mdi-camera-front", "mdi mdi-camera-front-variant", "mdi mdi-camera-gopro", "mdi mdi-camera-iris", "mdi mdi-camera-metering-center", "mdi mdi-camera-metering-matrix", "mdi mdi-camera-metering-partial", "mdi mdi-camera-metering-spot", "mdi mdi-camera-off", "mdi mdi-camera-party-mode", "mdi mdi-camera-rear", "mdi mdi-camera-rear-variant", "mdi mdi-camera-switch", "mdi mdi-camera-timer", "mdi mdi-cancel", "mdi mdi-candle", "mdi mdi-candycane", "mdi mdi-cannabis", "mdi mdi-car", "mdi mdi-car-battery", "mdi mdi-car-connected", "mdi mdi-car-convertable", "mdi mdi-car-estate", "mdi mdi-car-hatchback", "mdi mdi-car-pickup", "mdi mdi-car-side", "mdi mdi-car-sports", "mdi mdi-car-wash", "mdi mdi-caravan", "mdi mdi-cards", "mdi mdi-cards-outline", "mdi mdi-cards-playing-outline", "mdi mdi-cards-variant", "mdi mdi-carrot", "mdi mdi-cart", "mdi mdi-cart-off", "mdi mdi-cart-outline", "mdi mdi-cart-plus", "mdi mdi-case-sensitive-alt", "mdi mdi-cash", "mdi mdi-cash-100", "mdi mdi-cash-multiple", "mdi mdi-cash-usd", "mdi mdi-cast", "mdi mdi-cast-connected", "mdi mdi-cast-off", "mdi mdi-castle", "mdi mdi-cat", "mdi mdi-cctv", "mdi mdi-ceiling-light", "mdi mdi-cellphone", "mdi mdi-cellphone-android", "mdi mdi-cellphone-basic", "mdi mdi-cellphone-dock", "mdi mdi-cellphone-iphone", "mdi mdi-cellphone-link", "mdi mdi-cellphone-link-off", "mdi mdi-cellphone-settings", "mdi mdi-certificate", "mdi mdi-chair-school", "mdi mdi-chart-arc", "mdi mdi-chart-areaspline", "mdi mdi-chart-bar", "mdi mdi-chart-bar-stacked", "mdi mdi-chart-bubble", "mdi mdi-chart-donut", "mdi mdi-chart-donut-variant", "mdi mdi-chart-gantt", "mdi mdi-chart-histogram", "mdi mdi-chart-line", "mdi mdi-chart-line-stacked", "mdi mdi-chart-line-variant", "mdi mdi-chart-pie", "mdi mdi-chart-scatterplot-hexbin", "mdi mdi-chart-timeline", "mdi mdi-check", "mdi mdi-check-all", "mdi mdi-check-circle", "mdi mdi-check-circle-outline", "mdi mdi-checkbox-blank", "mdi mdi-checkbox-blank-circle", "mdi mdi-checkbox-blank-circle-outline", "mdi mdi-checkbox-blank-outline", "mdi mdi-checkbox-marked", "mdi mdi-checkbox-marked-circle", "mdi mdi-checkbox-marked-circle-outline", "mdi mdi-checkbox-marked-outline", "mdi mdi-checkbox-multiple-blank", "mdi mdi-checkbox-multiple-blank-circle", "mdi mdi-checkbox-multiple-blank-circle-outline", "mdi mdi-checkbox-multiple-blank-outline", "mdi mdi-checkbox-multiple-marked", "mdi mdi-checkbox-multiple-marked-circle", "mdi mdi-checkbox-multiple-marked-circle-outline", "mdi mdi-checkbox-multiple-marked-outline", "mdi mdi-checkerboard", "mdi mdi-chemical-weapon", "mdi mdi-chevron-double-down", "mdi mdi-chevron-double-left", "mdi mdi-chevron-double-right", "mdi mdi-chevron-double-up", "mdi mdi-chevron-down", "mdi mdi-chevron-left", "mdi mdi-chevron-right", "mdi mdi-chevron-up", "mdi mdi-chili-hot", "mdi mdi-chili-medium", "mdi mdi-chili-mild", "mdi mdi-chip", "mdi mdi-church", "mdi mdi-circle", "mdi mdi-circle-outline", "mdi mdi-cisco-webex", "mdi mdi-city", "mdi mdi-clipboard", "mdi mdi-clipboard-account", "mdi mdi-clipboard-alert", "mdi mdi-clipboard-arrow-down", "mdi mdi-clipboard-arrow-left", "mdi mdi-clipboard-check", "mdi mdi-clipboard-flow", "mdi mdi-clipboard-outline", "mdi mdi-clipboard-plus", "mdi mdi-clipboard-text", "mdi mdi-clippy", "mdi mdi-clock", "mdi mdi-clock-alert", "mdi mdi-clock-end", "mdi mdi-clock-fast", "mdi mdi-clock-in", "mdi mdi-clock-out", "mdi mdi-clock-start", "mdi mdi-close", "mdi mdi-close-box", "mdi mdi-close-box-outline", "mdi mdi-close-circle", "mdi mdi-close-circle-outline", "mdi mdi-close-network", "mdi mdi-close-octagon", "mdi mdi-close-octagon-outline", "mdi mdi-close-outline", "mdi mdi-closed-caption", "mdi mdi-cloud", "mdi mdi-cloud-braces", "mdi mdi-cloud-check", "mdi mdi-cloud-circle", "mdi mdi-cloud-download", "mdi mdi-cloud-off-outline", "mdi mdi-cloud-outline", "mdi mdi-cloud-print", "mdi mdi-cloud-print-outline", "mdi mdi-cloud-sync", "mdi mdi-cloud-tags", "mdi mdi-cloud-upload", "mdi mdi-code-array", "mdi mdi-code-braces", "mdi mdi-code-brackets", "mdi mdi-code-equal", "mdi mdi-code-greater-than", "mdi mdi-code-greater-than-or-equal", "mdi mdi-code-less-than", "mdi mdi-code-less-than-or-equal", "mdi mdi-code-not-equal", "mdi mdi-code-not-equal-variant", "mdi mdi-code-parentheses", "mdi mdi-code-string", "mdi mdi-code-tags", "mdi mdi-code-tags-check", "mdi mdi-codepen", "mdi mdi-coffee", "mdi mdi-coffee-outline", "mdi mdi-coffee-to-go", "mdi mdi-coin", "mdi mdi-coins", "mdi mdi-collage", "mdi mdi-color-helper", "mdi mdi-comment", "mdi mdi-comment-account", "mdi mdi-comment-account-outline", "mdi mdi-comment-alert", "mdi mdi-comment-alert-outline", "mdi mdi-comment-check", "mdi mdi-comment-check-outline", "mdi mdi-comment-multiple-outline", "mdi mdi-comment-outline", "mdi mdi-comment-plus-outline", "mdi mdi-comment-processing", "mdi mdi-comment-processing-outline", "mdi mdi-comment-question-outline", "mdi mdi-comment-remove-outline", "mdi mdi-comment-text", "mdi mdi-comment-text-outline", "mdi mdi-compare", "mdi mdi-compass", "mdi mdi-compass-outline", "mdi mdi-console", "mdi mdi-console-line", "mdi mdi-contact-mail", "mdi mdi-contacts", "mdi mdi-content-copy", "mdi mdi-content-cut", "mdi mdi-content-duplicate", "mdi mdi-content-paste", "mdi mdi-content-save", "mdi mdi-content-save-all", "mdi mdi-content-save-settings", "mdi mdi-contrast", "mdi mdi-contrast-box", "mdi mdi-contrast-circle", "mdi mdi-cookie", "mdi mdi-copyright", "mdi mdi-corn", "mdi mdi-counter", "mdi mdi-cow", "mdi mdi-creation", "mdi mdi-credit-card", "mdi mdi-credit-card-multiple", "mdi mdi-credit-card-off", "mdi mdi-credit-card-plus", "mdi mdi-credit-card-scan", "mdi mdi-crop", "mdi mdi-crop-free", "mdi mdi-crop-landscape", "mdi mdi-crop-portrait", "mdi mdi-crop-rotate", "mdi mdi-crop-square", "mdi mdi-crosshairs", "mdi mdi-crosshairs-gps", "mdi mdi-crown", "mdi mdi-cube", "mdi mdi-cube-outline", "mdi mdi-cube-send", "mdi mdi-cube-unfolded", "mdi mdi-cup", "mdi mdi-cup-off", "mdi mdi-cup-water", "mdi mdi-currency-btc", "mdi mdi-currency-chf", "mdi mdi-currency-cny", "mdi mdi-currency-eth", "mdi mdi-currency-eur", "mdi mdi-currency-gbp", "mdi mdi-currency-inr", "mdi mdi-currency-jpy", "mdi mdi-currency-krw", "mdi mdi-currency-ngn", "mdi mdi-currency-rub", "mdi mdi-currency-sign", "mdi mdi-currency-try", "mdi mdi-currency-twd", "mdi mdi-currency-usd", "mdi mdi-currency-usd-off", "mdi mdi-cursor-default", "mdi mdi-cursor-default-outline", "mdi mdi-cursor-move", "mdi mdi-cursor-pointer", "mdi mdi-cursor-text", "mdi mdi-database", "mdi mdi-database-minus", "mdi mdi-database-plus", "mdi mdi-debug-step-into", "mdi mdi-debug-step-out", "mdi mdi-debug-step-over", "mdi mdi-decagram", "mdi mdi-decagram-outline", "mdi mdi-decimal-decrease", "mdi mdi-decimal-increase", "mdi mdi-delete", "mdi mdi-delete-circle", "mdi mdi-delete-empty", "mdi mdi-delete-forever", "mdi mdi-delete-sweep", "mdi mdi-delete-variant", "mdi mdi-delta", "mdi mdi-deskphone", "mdi mdi-desktop-classic", "mdi mdi-desktop-mac", "mdi mdi-desktop-tower", "mdi mdi-details", "mdi mdi-developer-board", "mdi mdi-deviantart", "mdi mdi-dialpad", "mdi mdi-diamond", "mdi mdi-dice-1", "mdi mdi-dice-2", "mdi mdi-dice-3", "mdi mdi-dice-4", "mdi mdi-dice-5", "mdi mdi-dice-6", "mdi mdi-dice-d10", "mdi mdi-dice-d20", "mdi mdi-dice-d4", "mdi mdi-dice-d6", "mdi mdi-dice-d8", "mdi mdi-dice-multiple", "mdi mdi-dictionary", "mdi mdi-dip-switch", "mdi mdi-directions", "mdi mdi-directions-fork", "mdi mdi-discord", "mdi mdi-disk", "mdi mdi-disk-alert", "mdi mdi-disqus", "mdi mdi-disqus-outline", "mdi mdi-division", "mdi mdi-division-box", "mdi mdi-dna", "mdi mdi-dns", "mdi mdi-do-not-disturb", "mdi mdi-do-not-disturb-off", "mdi mdi-dolby", "mdi mdi-domain", "mdi mdi-donkey", "mdi mdi-dots-horizontal", "mdi mdi-dots-horizontal-circle", "mdi mdi-dots-vertical", "mdi mdi-dots-vertical-circle", "mdi mdi-douban", "mdi mdi-download", "mdi mdi-download-network", "mdi mdi-drag", "mdi mdi-drag-horizontal", "mdi mdi-drag-vertical", "mdi mdi-drawing", "mdi mdi-drawing-box", "mdi mdi-dribbble", "mdi mdi-dribbble-box", "mdi mdi-drone", "mdi mdi-dropbox", "mdi mdi-drupal", "mdi mdi-duck", "mdi mdi-dumbbell", "mdi mdi-ear-hearing", "mdi mdi-earth", "mdi mdi-earth-box", "mdi mdi-earth-box-off", "mdi mdi-earth-off", "mdi mdi-edge", "mdi mdi-eject", "mdi mdi-elephant", "mdi mdi-elevation-decline", "mdi mdi-elevation-rise", "mdi mdi-elevator", "mdi mdi-email", "mdi mdi-email-alert", "mdi mdi-email-open", "mdi mdi-email-open-outline", "mdi mdi-email-outline", "mdi mdi-email-secure", "mdi mdi-email-variant", "mdi mdi-emby", "mdi mdi-emoticon", "mdi mdi-emoticon-cool", "mdi mdi-emoticon-dead", "mdi mdi-emoticon-devil", "mdi mdi-emoticon-excited", "mdi mdi-emoticon-happy", "mdi mdi-emoticon-neutral", "mdi mdi-emoticon-poop", "mdi mdi-emoticon-sad", "mdi mdi-emoticon-tongue", "mdi mdi-engine", "mdi mdi-engine-outline", "mdi mdi-equal", "mdi mdi-equal-box", "mdi mdi-eraser", "mdi mdi-eraser-variant", "mdi mdi-escalator", "mdi mdi-ethernet", "mdi mdi-ethernet-cable", "mdi mdi-ethernet-cable-off", "mdi mdi-etsy", "mdi mdi-ev-station", "mdi mdi-eventbrite", "mdi mdi-evernote", "mdi mdi-exclamation", "mdi mdi-exit-to-app", "mdi mdi-export", "mdi mdi-eye", "mdi mdi-eye-off", "mdi mdi-eye-off-outline", "mdi mdi-eye-outline", "mdi mdi-eyedropper", "mdi mdi-eyedropper-variant", "mdi mdi-face", "mdi mdi-face-profile", "mdi mdi-facebook", "mdi mdi-facebook-box", "mdi mdi-facebook-messenger", "mdi mdi-factory", "mdi mdi-fan", "mdi mdi-fast-forward", "mdi mdi-fast-forward-outline", "mdi mdi-fax", "mdi mdi-feather", "mdi mdi-ferry", "mdi mdi-file", "mdi mdi-file-account", "mdi mdi-file-chart", "mdi mdi-file-check", "mdi mdi-file-cloud", "mdi mdi-file-delimited", "mdi mdi-file-document", "mdi mdi-file-document-box", "mdi mdi-file-excel", "mdi mdi-file-excel-box", "mdi mdi-file-export", "mdi mdi-file-find", "mdi mdi-file-hidden", "mdi mdi-file-image", "mdi mdi-file-import", "mdi mdi-file-lock", "mdi mdi-file-multiple", "mdi mdi-file-music", "mdi mdi-file-outline", "mdi mdi-file-pdf", "mdi mdi-file-pdf-box", "mdi mdi-file-plus", "mdi mdi-file-powerpoint", "mdi mdi-file-powerpoint-box", "mdi mdi-file-presentation-box", "mdi mdi-file-restore", "mdi mdi-file-send", "mdi mdi-file-tree", "mdi mdi-file-video", "mdi mdi-file-word", "mdi mdi-file-word-box", "mdi mdi-file-xml", "mdi mdi-film", "mdi mdi-filmstrip", "mdi mdi-filmstrip-off", "mdi mdi-filter", "mdi mdi-filter-outline", "mdi mdi-filter-remove", "mdi mdi-filter-remove-outline", "mdi mdi-filter-variant", "mdi mdi-find-replace", "mdi mdi-fingerprint", "mdi mdi-fire", "mdi mdi-firefox", "mdi mdi-fish", "mdi mdi-flag", "mdi mdi-flag-checkered", "mdi mdi-flag-outline", "mdi mdi-flag-outline-variant", "mdi mdi-flag-triangle", "mdi mdi-flag-variant", "mdi mdi-flash", "mdi mdi-flash-auto", "mdi mdi-flash-off", "mdi mdi-flash-outline", "mdi mdi-flash-red-eye", "mdi mdi-flashlight", "mdi mdi-flashlight-off", "mdi mdi-flask", "mdi mdi-flask-empty", "mdi mdi-flask-empty-outline", "mdi mdi-flask-outline", "mdi mdi-flattr", "mdi mdi-flip-to-back", "mdi mdi-flip-to-front", "mdi mdi-floppy", "mdi mdi-flower", "mdi mdi-folder", "mdi mdi-folder-account", "mdi mdi-folder-download", "mdi mdi-folder-google-drive", "mdi mdi-folder-image", "mdi mdi-folder-lock", "mdi mdi-folder-lock-open", "mdi mdi-folder-move", "mdi mdi-folder-multiple", "mdi mdi-folder-multiple-image", "mdi mdi-folder-multiple-outline", "mdi mdi-folder-open", "mdi mdi-folder-outline", "mdi mdi-folder-plus", "mdi mdi-folder-remove", "mdi mdi-folder-star", "mdi mdi-folder-upload", "mdi mdi-font-awesome", "mdi mdi-food", "mdi mdi-food-apple", "mdi mdi-food-croissant", "mdi mdi-food-fork-drink", "mdi mdi-food-off", "mdi mdi-food-variant", "mdi mdi-football", "mdi mdi-football-australian", "mdi mdi-football-helmet", "mdi mdi-forklift", "mdi mdi-format-align-bottom", "mdi mdi-format-align-center", "mdi mdi-format-align-justify", "mdi mdi-format-align-left", "mdi mdi-format-align-middle", "mdi mdi-format-align-right", "mdi mdi-format-align-top", "mdi mdi-format-annotation-plus", "mdi mdi-format-bold", "mdi mdi-format-clear", "mdi mdi-format-color-fill", "mdi mdi-format-color-text", "mdi mdi-format-float-center", "mdi mdi-format-float-left", "mdi mdi-format-float-none", "mdi mdi-format-float-right", "mdi mdi-format-font", "mdi mdi-format-header-1", "mdi mdi-format-header-2", "mdi mdi-format-header-3", "mdi mdi-format-header-4", "mdi mdi-format-header-5", "mdi mdi-format-header-6", "mdi mdi-format-header-decrease", "mdi mdi-format-header-equal", "mdi mdi-format-header-increase", "mdi mdi-format-header-pound", "mdi mdi-format-horizontal-align-center", "mdi mdi-format-horizontal-align-left", "mdi mdi-format-horizontal-align-right", "mdi mdi-format-indent-decrease", "mdi mdi-format-indent-increase", "mdi mdi-format-italic", "mdi mdi-format-line-spacing", "mdi mdi-format-line-style", "mdi mdi-format-line-weight", "mdi mdi-format-list-bulleted", "mdi mdi-format-list-bulleted-type", "mdi mdi-format-list-checks", "mdi mdi-format-list-numbers", "mdi mdi-format-page-break", "mdi mdi-format-paint", "mdi mdi-format-paragraph", "mdi mdi-format-pilcrow", "mdi mdi-format-quote-close", "mdi mdi-format-quote-open", "mdi mdi-format-rotate-90", "mdi mdi-format-section", "mdi mdi-format-size", "mdi mdi-format-strikethrough", "mdi mdi-format-strikethrough-variant", "mdi mdi-format-subscript", "mdi mdi-format-superscript", "mdi mdi-format-text", "mdi mdi-format-textdirection-l-to-r", "mdi mdi-format-textdirection-r-to-l", "mdi mdi-format-title", "mdi mdi-format-underline", "mdi mdi-format-vertical-align-bottom", "mdi mdi-format-vertical-align-center", "mdi mdi-format-vertical-align-top", "mdi mdi-format-wrap-inline", "mdi mdi-format-wrap-square", "mdi mdi-format-wrap-tight", "mdi mdi-format-wrap-top-bottom", "mdi mdi-forum", "mdi mdi-forward", "mdi mdi-foursquare", "mdi mdi-fridge", "mdi mdi-fridge-filled", "mdi mdi-fridge-filled-bottom", "mdi mdi-fridge-filled-top", "mdi mdi-fuel", "mdi mdi-fullscreen", "mdi mdi-fullscreen-exit", "mdi mdi-function", "mdi mdi-gamepad", "mdi mdi-gamepad-variant", "mdi mdi-garage", "mdi mdi-garage-open", "mdi mdi-gas-cylinder", "mdi mdi-gas-station", "mdi mdi-gate", "mdi mdi-gauge", "mdi mdi-gavel", "mdi mdi-gender-female", "mdi mdi-gender-male", "mdi mdi-gender-male-female", "mdi mdi-gender-transgender", "mdi mdi-gesture", "mdi mdi-gesture-double-tap", "mdi mdi-gesture-swipe-down", "mdi mdi-gesture-swipe-left", "mdi mdi-gesture-swipe-right", "mdi mdi-gesture-swipe-up", "mdi mdi-gesture-tap", "mdi mdi-gesture-two-double-tap", "mdi mdi-gesture-two-tap", "mdi mdi-ghost", "mdi mdi-gift", "mdi mdi-git", "mdi mdi-github-box", "mdi mdi-github-circle", "mdi mdi-github-face", "mdi mdi-glass-flute", "mdi mdi-glass-mug", "mdi mdi-glass-stange", "mdi mdi-glass-tulip", "mdi mdi-glassdoor", "mdi mdi-glasses", "mdi mdi-gmail", "mdi mdi-gnome", "mdi mdi-gondola", "mdi mdi-google", "mdi mdi-google-analytics", "mdi mdi-google-assistant", "mdi mdi-google-cardboard", "mdi mdi-google-chrome", "mdi mdi-google-circles", "mdi mdi-google-circles-communities", "mdi mdi-google-circles-extended", "mdi mdi-google-circles-group", "mdi mdi-google-controller", "mdi mdi-google-controller-off", "mdi mdi-google-drive", "mdi mdi-google-earth", "mdi mdi-google-glass", "mdi mdi-google-keep", "mdi mdi-google-maps", "mdi mdi-google-nearby", "mdi mdi-google-pages", "mdi mdi-google-photos", "mdi mdi-google-physical-web", "mdi mdi-google-play", "mdi mdi-google-plus", "mdi mdi-google-plus-box", "mdi mdi-google-translate", "mdi mdi-google-wallet", "mdi mdi-gradient", "mdi mdi-grease-pencil", "mdi mdi-grid", "mdi mdi-grid-large", "mdi mdi-grid-off", "mdi mdi-group", "mdi mdi-guitar-acoustic", "mdi mdi-guitar-electric", "mdi mdi-guitar-pick", "mdi mdi-guitar-pick-outline", "mdi mdi-hackernews", "mdi mdi-hamburger", "mdi mdi-hand-pointing-right", "mdi mdi-hanger", "mdi mdi-hangouts", "mdi mdi-harddisk", "mdi mdi-headphones", "mdi mdi-headphones-box", "mdi mdi-headphones-off", "mdi mdi-headphones-settings", "mdi mdi-headset", "mdi mdi-headset-dock", "mdi mdi-headset-off", "mdi mdi-heart", "mdi mdi-heart-box", "mdi mdi-heart-box-outline", "mdi mdi-heart-broken", "mdi mdi-heart-half", "mdi mdi-heart-half-full", "mdi mdi-heart-half-outline", "mdi mdi-heart-off", "mdi mdi-heart-outline", "mdi mdi-heart-pulse", "mdi mdi-help", "mdi mdi-help-box", "mdi mdi-help-circle", "mdi mdi-help-circle-outline", "mdi mdi-help-network", "mdi mdi-hexagon", "mdi mdi-hexagon-multiple", "mdi mdi-hexagon-outline", "mdi mdi-high-definition", "mdi mdi-highway", "mdi mdi-history", "mdi mdi-hololens", "mdi mdi-home", "mdi mdi-home-assistant", "mdi mdi-home-automation", "mdi mdi-home-circle", "mdi mdi-home-map-marker", "mdi mdi-home-modern", "mdi mdi-home-outline", "mdi mdi-home-variant", "mdi mdi-hook", "mdi mdi-hook-off", "mdi mdi-hops", "mdi mdi-hospital", "mdi mdi-hospital-building", "mdi mdi-hospital-marker", "mdi mdi-hotel", "mdi mdi-houzz", "mdi mdi-houzz-box", "mdi mdi-human", "mdi mdi-human-child", "mdi mdi-human-female", "mdi mdi-human-greeting", "mdi mdi-human-handsdown", "mdi mdi-human-handsup", "mdi mdi-human-male", "mdi mdi-human-male-female", "mdi mdi-human-pregnant", "mdi mdi-humble-bundle", "mdi mdi-image", "mdi mdi-image-album", "mdi mdi-image-area", "mdi mdi-image-area-close", "mdi mdi-image-broken", "mdi mdi-image-broken-variant", "mdi mdi-image-filter", "mdi mdi-image-filter-black-white", "mdi mdi-image-filter-center-focus", "mdi mdi-image-filter-center-focus-weak", "mdi mdi-image-filter-drama", "mdi mdi-image-filter-frames", "mdi mdi-image-filter-hdr", "mdi mdi-image-filter-none", "mdi mdi-image-filter-tilt-shift", "mdi mdi-image-filter-vintage", "mdi mdi-image-multiple", "mdi mdi-import", "mdi mdi-inbox", "mdi mdi-inbox-arrow-down", "mdi mdi-inbox-arrow-up", "mdi mdi-incognito", "mdi mdi-infinity", "mdi mdi-information", "mdi mdi-information-outline", "mdi mdi-information-variant", "mdi mdi-instagram", "mdi mdi-instapaper", "mdi mdi-internet-explorer", "mdi mdi-invert-colors", "mdi mdi-itunes", "mdi mdi-jeepney", "mdi mdi-jira", "mdi mdi-jsfiddle", "mdi mdi-json", "mdi mdi-keg", "mdi mdi-kettle", "mdi mdi-key", "mdi mdi-key-change", "mdi mdi-key-minus", "mdi mdi-key-plus", "mdi mdi-key-remove", "mdi mdi-key-variant", "mdi mdi-keyboard", "mdi mdi-keyboard-backspace", "mdi mdi-keyboard-caps", "mdi mdi-keyboard-close", "mdi mdi-keyboard-off", "mdi mdi-keyboard-return", "mdi mdi-keyboard-tab", "mdi mdi-keyboard-variant", "mdi mdi-kickstarter", "mdi mdi-kodi", "mdi mdi-label", "mdi mdi-label-outline", "mdi mdi-lambda", "mdi mdi-lamp", "mdi mdi-lan", "mdi mdi-lan-connect", "mdi mdi-lan-disconnect", "mdi mdi-lan-pending", "mdi mdi-language-c", "mdi mdi-language-cpp", "mdi mdi-language-csharp", "mdi mdi-language-css3", "mdi mdi-language-go", "mdi mdi-language-html5", "mdi mdi-language-javascript", "mdi mdi-language-php", "mdi mdi-language-python", "mdi mdi-language-python-text", "mdi mdi-language-r", "mdi mdi-language-swift", "mdi mdi-language-typescript", "mdi mdi-laptop", "mdi mdi-laptop-chromebook", "mdi mdi-laptop-mac", "mdi mdi-laptop-off", "mdi mdi-laptop-windows", "mdi mdi-lastfm", "mdi mdi-launch", "mdi mdi-lava-lamp", "mdi mdi-layers", "mdi mdi-layers-off", "mdi mdi-lead-pencil", "mdi mdi-leaf", "mdi mdi-led-off", "mdi mdi-led-on", "mdi mdi-led-outline", "mdi mdi-led-strip", "mdi mdi-led-variant-off", "mdi mdi-led-variant-on", "mdi mdi-led-variant-outline", "mdi mdi-library", "mdi mdi-library-books", "mdi mdi-library-music", "mdi mdi-library-plus", "mdi mdi-lightbulb", "mdi mdi-lightbulb-on", "mdi mdi-lightbulb-on-outline", "mdi mdi-lightbulb-outline", "mdi mdi-link", "mdi mdi-link-off", "mdi mdi-link-variant", "mdi mdi-link-variant-off", "mdi mdi-linkedin", "mdi mdi-linkedin-box", "mdi mdi-linux", "mdi mdi-loading", "mdi mdi-lock", "mdi mdi-lock-open", "mdi mdi-lock-open-outline", "mdi mdi-lock-outline", "mdi mdi-lock-pattern", "mdi mdi-lock-plus", "mdi mdi-lock-reset", "mdi mdi-locker", "mdi mdi-locker-multiple", "mdi mdi-login", "mdi mdi-login-variant", "mdi mdi-logout", "mdi mdi-logout-variant", "mdi mdi-looks", "mdi mdi-loop", "mdi mdi-loupe", "mdi mdi-lumx", "mdi mdi-magnet", "mdi mdi-magnet-on", "mdi mdi-magnify", "mdi mdi-magnify-minus", "mdi mdi-magnify-minus-outline", "mdi mdi-magnify-plus", "mdi mdi-magnify-plus-outline", "mdi mdi-mail-ru", "mdi mdi-mailbox", "mdi mdi-map", "mdi mdi-map-marker", "mdi mdi-map-marker-circle", "mdi mdi-map-marker-minus", "mdi mdi-map-marker-multiple", "mdi mdi-map-marker-off", "mdi mdi-map-marker-outline", "mdi mdi-map-marker-plus", "mdi mdi-map-marker-radius", "mdi mdi-margin", "mdi mdi-markdown", "mdi mdi-marker", "mdi mdi-marker-check", "mdi mdi-martini", "mdi mdi-material-ui", "mdi mdi-math-compass", "mdi mdi-matrix", "mdi mdi-maxcdn", "mdi mdi-medical-bag", "mdi mdi-medium", "mdi mdi-memory", "mdi mdi-menu", "mdi mdi-menu-down", "mdi mdi-menu-down-outline", "mdi mdi-menu-left", "mdi mdi-menu-right", "mdi mdi-menu-up", "mdi mdi-menu-up-outline", "mdi mdi-message", "mdi mdi-message-alert", "mdi mdi-message-bulleted", "mdi mdi-message-bulleted-off", "mdi mdi-message-draw", "mdi mdi-message-image", "mdi mdi-message-outline", "mdi mdi-message-plus", "mdi mdi-message-processing", "mdi mdi-message-reply", "mdi mdi-message-reply-text", "mdi mdi-message-settings", "mdi mdi-message-settings-variant", "mdi mdi-message-text", "mdi mdi-message-text-outline", "mdi mdi-message-video", "mdi mdi-meteor", "mdi mdi-metronome", "mdi mdi-metronome-tick", "mdi mdi-micro-sd", "mdi mdi-microphone", "mdi mdi-microphone-off", "mdi mdi-microphone-outline", "mdi mdi-microphone-settings", "mdi mdi-microphone-variant", "mdi mdi-microphone-variant-off", "mdi mdi-microscope", "mdi mdi-microsoft", "mdi mdi-minecraft", "mdi mdi-minus", "mdi mdi-minus-box", "mdi mdi-minus-box-outline", "mdi mdi-minus-circle", "mdi mdi-minus-circle-outline", "mdi mdi-minus-network", "mdi mdi-mixcloud", "mdi mdi-mixer", "mdi mdi-monitor", "mdi mdi-monitor-multiple", "mdi mdi-more", "mdi mdi-motorbike", "mdi mdi-mouse", "mdi mdi-mouse-off", "mdi mdi-mouse-variant", "mdi mdi-mouse-variant-off", "mdi mdi-move-resize", "mdi mdi-move-resize-variant", "mdi mdi-movie", "mdi mdi-movie-roll", "mdi mdi-multiplication", "mdi mdi-multiplication-box", "mdi mdi-mushroom", "mdi mdi-mushroom-outline", "mdi mdi-music", "mdi mdi-music-box", "mdi mdi-music-box-outline", "mdi mdi-music-circle", "mdi mdi-music-note", "mdi mdi-music-note-bluetooth", "mdi mdi-music-note-bluetooth-off", "mdi mdi-music-note-eighth", "mdi mdi-music-note-half", "mdi mdi-music-note-off", "mdi mdi-music-note-quarter", "mdi mdi-music-note-sixteenth", "mdi mdi-music-note-whole", "mdi mdi-music-off", "mdi mdi-nature", "mdi mdi-nature-people", "mdi mdi-navigation", "mdi mdi-near-me", "mdi mdi-needle", "mdi mdi-nest-protect", "mdi mdi-nest-thermostat", "mdi mdi-netflix", "mdi mdi-network", "mdi mdi-new-box", "mdi mdi-newspaper", "mdi mdi-nfc", "mdi mdi-nfc-tap", "mdi mdi-nfc-variant", "mdi mdi-ninja", "mdi mdi-nintendo-switch", "mdi mdi-nodejs", "mdi mdi-note", "mdi mdi-note-multiple", "mdi mdi-note-multiple-outline", "mdi mdi-note-outline", "mdi mdi-note-plus", "mdi mdi-note-plus-outline", "mdi mdi-note-text", "mdi mdi-notification-clear-all", "mdi mdi-npm", "mdi mdi-nuke", "mdi mdi-null", "mdi mdi-numeric", "mdi mdi-numeric-0-box", "mdi mdi-numeric-0-box-multiple-outline", "mdi mdi-numeric-0-box-outline", "mdi mdi-numeric-1-box", "mdi mdi-numeric-1-box-multiple-outline", "mdi mdi-numeric-1-box-outline", "mdi mdi-numeric-2-box", "mdi mdi-numeric-2-box-multiple-outline", "mdi mdi-numeric-2-box-outline", "mdi mdi-numeric-3-box", "mdi mdi-numeric-3-box-multiple-outline", "mdi mdi-numeric-3-box-outline", "mdi mdi-numeric-4-box", "mdi mdi-numeric-4-box-multiple-outline", "mdi mdi-numeric-4-box-outline", "mdi mdi-numeric-5-box", "mdi mdi-numeric-5-box-multiple-outline", "mdi mdi-numeric-5-box-outline", "mdi mdi-numeric-6-box", "mdi mdi-numeric-6-box-multiple-outline", "mdi mdi-numeric-6-box-outline", "mdi mdi-numeric-7-box", "mdi mdi-numeric-7-box-multiple-outline", "mdi mdi-numeric-7-box-outline", "mdi mdi-numeric-8-box", "mdi mdi-numeric-8-box-multiple-outline", "mdi mdi-numeric-8-box-outline", "mdi mdi-numeric-9-box", "mdi mdi-numeric-9-box-multiple-outline", "mdi mdi-numeric-9-box-outline", "mdi mdi-numeric-9-plus-box", "mdi mdi-numeric-9-plus-box-multiple-outline", "mdi mdi-numeric-9-plus-box-outline", "mdi mdi-nut", "mdi mdi-nutrition", "mdi mdi-oar", "mdi mdi-octagon", "mdi mdi-octagon-outline", "mdi mdi-octagram", "mdi mdi-octagram-outline", "mdi mdi-odnoklassniki", "mdi mdi-office", "mdi mdi-oil", "mdi mdi-oil-temperature", "mdi mdi-omega", "mdi mdi-onedrive", "mdi mdi-onenote", "mdi mdi-opacity", "mdi mdi-open-in-app", "mdi mdi-open-in-new", "mdi mdi-openid", "mdi mdi-opera", "mdi mdi-orbit", "mdi mdi-ornament", "mdi mdi-ornament-variant", "mdi mdi-owl", "mdi mdi-package", "mdi mdi-package-down", "mdi mdi-package-up", "mdi mdi-package-variant", "mdi mdi-package-variant-closed", "mdi mdi-page-first", "mdi mdi-page-last", "mdi mdi-page-layout-body", "mdi mdi-page-layout-footer", "mdi mdi-page-layout-header", "mdi mdi-page-layout-sidebar-left", "mdi mdi-page-layout-sidebar-right", "mdi mdi-palette", "mdi mdi-palette-advanced", "mdi mdi-panda", "mdi mdi-pandora", "mdi mdi-panorama", "mdi mdi-panorama-fisheye", "mdi mdi-panorama-horizontal", "mdi mdi-panorama-vertical", "mdi mdi-panorama-wide-angle", "mdi mdi-paper-cut-vertical", "mdi mdi-paperclip", "mdi mdi-parking", "mdi mdi-passport", "mdi mdi-pause", "mdi mdi-pause-circle", "mdi mdi-pause-circle-outline", "mdi mdi-pause-octagon", "mdi mdi-pause-octagon-outline", "mdi mdi-paw", "mdi mdi-paw-off", "mdi mdi-pen", "mdi mdi-pencil", "mdi mdi-pencil-box", "mdi mdi-pencil-box-outline", "mdi mdi-pencil-circle", "mdi mdi-pencil-circle-outline", "mdi mdi-pencil-lock", "mdi mdi-pencil-off", "mdi mdi-pentagon", "mdi mdi-pentagon-outline", "mdi mdi-percent", "mdi mdi-periodic-table-co2", "mdi mdi-periscope", "mdi mdi-pharmacy", "mdi mdi-phone", "mdi mdi-phone-bluetooth", "mdi mdi-phone-classic", "mdi mdi-phone-forward", "mdi mdi-phone-hangup", "mdi mdi-phone-in-talk", "mdi mdi-phone-incoming", "mdi mdi-phone-locked", "mdi mdi-phone-log", "mdi mdi-phone-minus", "mdi mdi-phone-missed", "mdi mdi-phone-outgoing", "mdi mdi-phone-paused", "mdi mdi-phone-plus", "mdi mdi-phone-settings", "mdi mdi-phone-voip", "mdi mdi-pi", "mdi mdi-pi-box", "mdi mdi-piano", "mdi mdi-pig", "mdi mdi-pill", "mdi mdi-pillar", "mdi mdi-pin", "mdi mdi-pin-off", "mdi mdi-pine-tree", "mdi mdi-pine-tree-box", "mdi mdi-pinterest", "mdi mdi-pinterest-box", "mdi mdi-pipe", "mdi mdi-pipe-disconnected", "mdi mdi-pistol", "mdi mdi-pizza", "mdi mdi-plane-shield", "mdi mdi-play", "mdi mdi-play-box-outline", "mdi mdi-play-circle", "mdi mdi-play-circle-outline", "mdi mdi-play-pause", "mdi mdi-play-protected-content", "mdi mdi-playlist-check", "mdi mdi-playlist-minus", "mdi mdi-playlist-play", "mdi mdi-playlist-plus", "mdi mdi-playlist-remove", "mdi mdi-playstation", "mdi mdi-plex", "mdi mdi-plus", "mdi mdi-plus-box", "mdi mdi-plus-box-outline", "mdi mdi-plus-circle", "mdi mdi-plus-circle-multiple-outline", "mdi mdi-plus-circle-outline", "mdi mdi-plus-network", "mdi mdi-plus-one", "mdi mdi-plus-outline", "mdi mdi-pocket", "mdi mdi-pokeball", "mdi mdi-polaroid", "mdi mdi-poll", "mdi mdi-poll-box", "mdi mdi-polymer", "mdi mdi-pool", "mdi mdi-popcorn", "mdi mdi-pot", "mdi mdi-pot-mix", "mdi mdi-pound", "mdi mdi-pound-box", "mdi mdi-power", "mdi mdi-power-plug", "mdi mdi-power-plug-off", "mdi mdi-power-settings", "mdi mdi-power-socket", "mdi mdi-power-socket-eu", "mdi mdi-power-socket-uk", "mdi mdi-power-socket-us", "mdi mdi-prescription", "mdi mdi-presentation", "mdi mdi-presentation-play", "mdi mdi-printer", "mdi mdi-printer-3d", "mdi mdi-printer-alert", "mdi mdi-printer-settings", "mdi mdi-priority-high", "mdi mdi-priority-low", "mdi mdi-professional-hexagon", "mdi mdi-projector", "mdi mdi-projector-screen", "mdi mdi-publish", "mdi mdi-pulse", "mdi mdi-puzzle", "mdi mdi-qqchat", "mdi mdi-qrcode", "mdi mdi-qrcode-scan", "mdi mdi-quadcopter", "mdi mdi-quality-high", "mdi mdi-quicktime", "mdi mdi-radar", "mdi mdi-radiator", "mdi mdi-radio", "mdi mdi-radio-handheld", "mdi mdi-radio-tower", "mdi mdi-radioactive", "mdi mdi-radiobox-blank", "mdi mdi-radiobox-marked", "mdi mdi-raspberrypi", "mdi mdi-ray-end", "mdi mdi-ray-end-arrow", "mdi mdi-ray-start", "mdi mdi-ray-start-arrow", "mdi mdi-ray-start-end", "mdi mdi-ray-vertex", "mdi mdi-rdio", "mdi mdi-react", "mdi mdi-read", "mdi mdi-readability", "mdi mdi-receipt", "mdi mdi-record", "mdi mdi-record-rec", "mdi mdi-recycle", "mdi mdi-reddit", "mdi mdi-redo", "mdi mdi-redo-variant", "mdi mdi-refresh", "mdi mdi-regex", "mdi mdi-relative-scale", "mdi mdi-reload", "mdi mdi-remote", "mdi mdi-rename-box", "mdi mdi-reorder-horizontal", "mdi mdi-reorder-vertical", "mdi mdi-repeat", "mdi mdi-repeat-off", "mdi mdi-repeat-once", "mdi mdi-replay", "mdi mdi-reply", "mdi mdi-reply-all", "mdi mdi-reproduction", "mdi mdi-resize-bottom-right", "mdi mdi-responsive", "mdi mdi-restart", "mdi mdi-restore", "mdi mdi-rewind", "mdi mdi-rewind-outline", "mdi mdi-rhombus", "mdi mdi-rhombus-outline", "mdi mdi-ribbon", "mdi mdi-rice", "mdi mdi-ring", "mdi mdi-road", "mdi mdi-road-variant", "mdi mdi-robot", "mdi mdi-rocket", "mdi mdi-roomba", "mdi mdi-rotate-3d", "mdi mdi-rotate-left", "mdi mdi-rotate-left-variant", "mdi mdi-rotate-right", "mdi mdi-rotate-right-variant", "mdi mdi-rounded-corner", "mdi mdi-router-wireless", "mdi mdi-routes", "mdi mdi-rowing", "mdi mdi-rss", "mdi mdi-rss-box", "mdi mdi-ruler", "mdi mdi-run", "mdi mdi-run-fast", "mdi mdi-sale", "mdi mdi-sass", "mdi mdi-satellite", "mdi mdi-satellite-variant", "mdi mdi-saxophone", "mdi mdi-scale", "mdi mdi-scale-balance", "mdi mdi-scale-bathroom", "mdi mdi-scanner", "mdi mdi-school", "mdi mdi-screen-rotation", "mdi mdi-screen-rotation-lock", "mdi mdi-screwdriver", "mdi mdi-script", "mdi mdi-sd", "mdi mdi-seal", "mdi mdi-search-web", "mdi mdi-seat-flat", "mdi mdi-seat-flat-angled", "mdi mdi-seat-individual-suite", "mdi mdi-seat-legroom-extra", "mdi mdi-seat-legroom-normal", "mdi mdi-seat-legroom-reduced", "mdi mdi-seat-recline-extra", "mdi mdi-seat-recline-normal", "mdi mdi-security", "mdi mdi-security-home", "mdi mdi-security-network", "mdi mdi-select", "mdi mdi-select-all", "mdi mdi-select-inverse", "mdi mdi-select-off", "mdi mdi-selection", "mdi mdi-selection-off", "mdi mdi-send", "mdi mdi-send-secure", "mdi mdi-serial-port", "mdi mdi-server", "mdi mdi-server-minus", "mdi mdi-server-network", "mdi mdi-server-network-off", "mdi mdi-server-off", "mdi mdi-server-plus", "mdi mdi-server-remove", "mdi mdi-server-security", "mdi mdi-set-all", "mdi mdi-set-center", "mdi mdi-set-center-right", "mdi mdi-set-left", "mdi mdi-set-left-center", "mdi mdi-set-left-right", "mdi mdi-set-none", "mdi mdi-set-right", "mdi mdi-settings", "mdi mdi-settings-box", "mdi mdi-shape-circle-plus", "mdi mdi-shape-plus", "mdi mdi-shape-polygon-plus", "mdi mdi-shape-rectangle-plus", "mdi mdi-shape-square-plus", "mdi mdi-share", "mdi mdi-share-variant", "mdi mdi-shield", "mdi mdi-shield-half-full", "mdi mdi-shield-outline", "mdi mdi-shopping", "mdi mdi-shopping-music", "mdi mdi-shovel", "mdi mdi-shovel-off", "mdi mdi-shredder", "mdi mdi-shuffle", "mdi mdi-shuffle-disabled", "mdi mdi-shuffle-variant", "mdi mdi-sigma", "mdi mdi-sigma-lower", "mdi mdi-sign-caution", "mdi mdi-sign-direction", "mdi mdi-sign-text", "mdi mdi-signal", "mdi mdi-signal-2g", "mdi mdi-signal-3g", "mdi mdi-signal-4g", "mdi mdi-signal-hspa", "mdi mdi-signal-hspa-plus", "mdi mdi-signal-off", "mdi mdi-signal-variant", "mdi mdi-silverware", "mdi mdi-silverware-fork", "mdi mdi-silverware-spoon", "mdi mdi-silverware-variant", "mdi mdi-sim", "mdi mdi-sim-alert", "mdi mdi-sim-off", "mdi mdi-sitemap", "mdi mdi-skip-backward", "mdi mdi-skip-forward", "mdi mdi-skip-next", "mdi mdi-skip-next-circle", "mdi mdi-skip-next-circle-outline", "mdi mdi-skip-previous", "mdi mdi-skip-previous-circle", "mdi mdi-skip-previous-circle-outline", "mdi mdi-skull", "mdi mdi-skype", "mdi mdi-skype-business", "mdi mdi-slack", "mdi mdi-sleep", "mdi mdi-sleep-off", "mdi mdi-smoking", "mdi mdi-smoking-off", "mdi mdi-snapchat", "mdi mdi-snowflake", "mdi mdi-snowman", "mdi mdi-soccer", "mdi mdi-sofa", "mdi mdi-solid", "mdi mdi-sort", "mdi mdi-sort-alphabetical", "mdi mdi-sort-ascending", "mdi mdi-sort-descending", "mdi mdi-sort-numeric", "mdi mdi-sort-variant", "mdi mdi-soundcloud", "mdi mdi-source-branch", "mdi mdi-source-commit", "mdi mdi-source-commit-end", "mdi mdi-source-commit-end-local", "mdi mdi-source-commit-local", "mdi mdi-source-commit-next-local", "mdi mdi-source-commit-start", "mdi mdi-source-commit-start-next-local", "mdi mdi-source-fork", "mdi mdi-source-merge", "mdi mdi-source-pull", "mdi mdi-soy-sauce", "mdi mdi-speaker", "mdi mdi-speaker-off", "mdi mdi-speaker-wireless", "mdi mdi-speedometer", "mdi mdi-spellcheck", "mdi mdi-spotify", "mdi mdi-spotlight", "mdi mdi-spotlight-beam", "mdi mdi-spray", "mdi mdi-square", "mdi mdi-square-inc", "mdi mdi-square-inc-cash", "mdi mdi-square-outline", "mdi mdi-square-root", "mdi mdi-stackexchange", "mdi mdi-stackoverflow", "mdi mdi-stadium", "mdi mdi-stairs", "mdi mdi-standard-definition", "mdi mdi-star", "mdi mdi-star-circle", "mdi mdi-star-half", "mdi mdi-star-off", "mdi mdi-star-outline", "mdi mdi-steam", "mdi mdi-steering", "mdi mdi-step-backward", "mdi mdi-step-backward-2", "mdi mdi-step-forward", "mdi mdi-step-forward-2", "mdi mdi-stethoscope", "mdi mdi-sticker", "mdi mdi-sticker-emoji", "mdi mdi-stocking", "mdi mdi-stop", "mdi mdi-stop-circle", "mdi mdi-stop-circle-outline", "mdi mdi-store", "mdi mdi-store-24-hour", "mdi mdi-stove", "mdi mdi-subdirectory-arrow-left", "mdi mdi-subdirectory-arrow-right", "mdi mdi-subway", "mdi mdi-subway-variant", "mdi mdi-summit", "mdi mdi-sunglasses", "mdi mdi-surround-sound", "mdi mdi-surround-sound-2-0", "mdi mdi-surround-sound-3-1", "mdi mdi-surround-sound-5-1", "mdi mdi-surround-sound-7-1", "mdi mdi-svg", "mdi mdi-swap-horizontal", "mdi mdi-swap-vertical", "mdi mdi-swim", "mdi mdi-switch", "mdi mdi-sword", "mdi mdi-sword-cross", "mdi mdi-sync", "mdi mdi-sync-alert", "mdi mdi-sync-off", "mdi mdi-tab", "mdi mdi-tab-plus", "mdi mdi-tab-unselected", "mdi mdi-table", "mdi mdi-table-column-plus-after", "mdi mdi-table-column-plus-before", "mdi mdi-table-column-remove", "mdi mdi-table-column-width", "mdi mdi-table-edit", "mdi mdi-table-large", "mdi mdi-table-row-height", "mdi mdi-table-row-plus-after", "mdi mdi-table-row-plus-before", "mdi mdi-table-row-remove", "mdi mdi-tablet", "mdi mdi-tablet-android", "mdi mdi-tablet-ipad", "mdi mdi-taco", "mdi mdi-tag", "mdi mdi-tag-faces", "mdi mdi-tag-heart", "mdi mdi-tag-multiple", "mdi mdi-tag-outline", "mdi mdi-tag-plus", "mdi mdi-tag-remove", "mdi mdi-tag-text-outline", "mdi mdi-target", "mdi mdi-taxi", "mdi mdi-teamviewer", "mdi mdi-telegram", "mdi mdi-television", "mdi mdi-television-classic", "mdi mdi-television-guide", "mdi mdi-temperature-celsius", "mdi mdi-temperature-fahrenheit", "mdi mdi-temperature-kelvin", "mdi mdi-tennis", "mdi mdi-tent", "mdi mdi-terrain", "mdi mdi-test-tube", "mdi mdi-text-shadow", "mdi mdi-text-to-speech", "mdi mdi-text-to-speech-off", "mdi mdi-textbox", "mdi mdi-textbox-password", "mdi mdi-texture", "mdi mdi-theater", "mdi mdi-theme-light-dark", "mdi mdi-thermometer", "mdi mdi-thermometer-lines", "mdi mdi-thought-bubble", "mdi mdi-thought-bubble-outline", "mdi mdi-thumb-down", "mdi mdi-thumb-down-outline", "mdi mdi-thumb-up", "mdi mdi-thumb-up-outline", "mdi mdi-thumbs-up-down", "mdi mdi-ticket", "mdi mdi-ticket-account", "mdi mdi-ticket-confirmation", "mdi mdi-ticket-percent", "mdi mdi-tie", "mdi mdi-tilde", "mdi mdi-timelapse", "mdi mdi-timer", "mdi mdi-timer-10", "mdi mdi-timer-3", "mdi mdi-timer-off", "mdi mdi-timer-sand", "mdi mdi-timer-sand-empty", "mdi mdi-timer-sand-full", "mdi mdi-timetable", "mdi mdi-toggle-switch", "mdi mdi-toggle-switch-off", "mdi mdi-tooltip", "mdi mdi-tooltip-edit", "mdi mdi-tooltip-image", "mdi mdi-tooltip-outline", "mdi mdi-tooltip-outline-plus", "mdi mdi-tooltip-text", "mdi mdi-tooth", "mdi mdi-tor", "mdi mdi-tower-beach", "mdi mdi-tower-fire", "mdi mdi-trackpad", "mdi mdi-traffic-light", "mdi mdi-train", "mdi mdi-tram", "mdi mdi-transcribe", "mdi mdi-transcribe-close", "mdi mdi-transfer", "mdi mdi-transit-transfer", "mdi mdi-translate", "mdi mdi-treasure-chest", "mdi mdi-tree", "mdi mdi-trello", "mdi mdi-trending-down", "mdi mdi-trending-neutral", "mdi mdi-trending-up", "mdi mdi-triangle", "mdi mdi-triangle-outline", "mdi mdi-trophy", "mdi mdi-trophy-award", "mdi mdi-trophy-outline", "mdi mdi-trophy-variant", "mdi mdi-trophy-variant-outline", "mdi mdi-truck", "mdi mdi-truck-delivery", "mdi mdi-truck-fast", "mdi mdi-truck-trailer", "mdi mdi-tshirt-crew", "mdi mdi-tshirt-v", "mdi mdi-tumblr", "mdi mdi-tumblr-reblog", "mdi mdi-tune", "mdi mdi-tune-vertical", "mdi mdi-twitch", "mdi mdi-twitter", "mdi mdi-twitter-box", "mdi mdi-twitter-circle", "mdi mdi-twitter-retweet", "mdi mdi-uber", "mdi mdi-ubuntu", "mdi mdi-ultra-high-definition", "mdi mdi-umbraco", "mdi mdi-umbrella", "mdi mdi-umbrella-outline", "mdi mdi-undo", "mdi mdi-undo-variant", "mdi mdi-unfold-less-horizontal", "mdi mdi-unfold-less-vertical", "mdi mdi-unfold-more-horizontal", "mdi mdi-unfold-more-vertical", "mdi mdi-ungroup", "mdi mdi-unity", "mdi mdi-untappd", "mdi mdi-update", "mdi mdi-upload", "mdi mdi-upload-network", "mdi mdi-usb", "mdi mdi-van-passenger", "mdi mdi-van-utility", "mdi mdi-vanish", "mdi mdi-vector-arrange-above", "mdi mdi-vector-arrange-below", "mdi mdi-vector-circle", "mdi mdi-vector-circle-variant", "mdi mdi-vector-combine", "mdi mdi-vector-curve", "mdi mdi-vector-difference", "mdi mdi-vector-difference-ab", "mdi mdi-vector-difference-ba", "mdi mdi-vector-intersection", "mdi mdi-vector-line", "mdi mdi-vector-point", "mdi mdi-vector-polygon", "mdi mdi-vector-polyline", "mdi mdi-vector-radius", "mdi mdi-vector-rectangle", "mdi mdi-vector-selection", "mdi mdi-vector-square", "mdi mdi-vector-triangle", "mdi mdi-vector-union", "mdi mdi-verified", "mdi mdi-vibrate", "mdi mdi-video", "mdi mdi-video-3d", "mdi mdi-video-off", "mdi mdi-video-switch", "mdi mdi-view-agenda", "mdi mdi-view-array", "mdi mdi-view-carousel", "mdi mdi-view-column", "mdi mdi-view-dashboard", "mdi mdi-view-day", "mdi mdi-view-grid", "mdi mdi-view-headline", "mdi mdi-view-list", "mdi mdi-view-module", "mdi mdi-view-parallel", "mdi mdi-view-quilt", "mdi mdi-view-sequential", "mdi mdi-view-stream", "mdi mdi-view-week", "mdi mdi-vimeo", "mdi mdi-vine", "mdi mdi-violin", "mdi mdi-visualstudio", "mdi mdi-vk", "mdi mdi-vk-box", "mdi mdi-vk-circle", "mdi mdi-vlc", "mdi mdi-voice", "mdi mdi-voicemail", "mdi mdi-volume-high", "mdi mdi-volume-low", "mdi mdi-volume-medium", "mdi mdi-volume-minus", "mdi mdi-volume-mute", "mdi mdi-volume-off", "mdi mdi-volume-plus", "mdi mdi-vpn", "mdi mdi-walk", "mdi mdi-wall", "mdi mdi-wallet", "mdi mdi-wallet-giftcard", "mdi mdi-wallet-membership", "mdi mdi-wallet-travel", "mdi mdi-wan", "mdi mdi-washing-machine", "mdi mdi-watch", "mdi mdi-watch-export", "mdi mdi-watch-import", "mdi mdi-watch-vibrate", "mdi mdi-water", "mdi mdi-water-off", "mdi mdi-water-percent", "mdi mdi-water-pump", "mdi mdi-watermark", "mdi mdi-waves", "mdi mdi-weather-cloudy", "mdi mdi-weather-fog", "mdi mdi-weather-hail", "mdi mdi-weather-lightning", "mdi mdi-weather-lightning-rainy", "mdi mdi-weather-night", "mdi mdi-weather-partlycloudy", "mdi mdi-weather-pouring", "mdi mdi-weather-rainy", "mdi mdi-weather-snowy", "mdi mdi-weather-snowy-rainy", "mdi mdi-weather-sunny", "mdi mdi-weather-sunset", "mdi mdi-weather-sunset-down", "mdi mdi-weather-sunset-up", "mdi mdi-weather-windy", "mdi mdi-weather-windy-variant", "mdi mdi-web", "mdi mdi-webcam", "mdi mdi-webhook", "mdi mdi-webpack", "mdi mdi-wechat", "mdi mdi-weight", "mdi mdi-weight-kilogram", "mdi mdi-whatsapp", "mdi mdi-wheelchair-accessibility", "mdi mdi-white-balance-auto", "mdi mdi-white-balance-incandescent", "mdi mdi-white-balance-iridescent", "mdi mdi-white-balance-sunny", "mdi mdi-widgets", "mdi mdi-wifi", "mdi mdi-wifi-off", "mdi mdi-wii", "mdi mdi-wiiu", "mdi mdi-wikipedia", "mdi mdi-window-close", "mdi mdi-window-closed", "mdi mdi-window-maximize", "mdi mdi-window-minimize", "mdi mdi-window-open", "mdi mdi-window-restore", "mdi mdi-windows", "mdi mdi-wordpress", "mdi mdi-worker", "mdi mdi-wrap", "mdi mdi-wrench", "mdi mdi-wunderlist", "mdi mdi-xaml", "mdi mdi-xbox", "mdi mdi-xbox-controller", "mdi mdi-xbox-controller-battery-alert", "mdi mdi-xbox-controller-battery-empty", "mdi mdi-xbox-controller-battery-full", "mdi mdi-xbox-controller-battery-low", "mdi mdi-xbox-controller-battery-medium", "mdi mdi-xbox-controller-battery-unknown", "mdi mdi-xbox-controller-off", "mdi mdi-xda", "mdi mdi-xing", "mdi mdi-xing-box", "mdi mdi-xing-circle", "mdi mdi-xml", "mdi mdi-xmpp", "mdi mdi-yammer", "mdi mdi-yeast", "mdi mdi-yelp", "mdi mdi-yin-yang", "mdi mdi-youtube-play", "mdi mdi-zip-box", "mdi mdi-blank"],
		emotions: {
			"1": ["[微笑]", XCV3Config.staticurl + "images/wechat/emoji/1.png"],
			"2": ["[撇嘴]", XCV3Config.staticurl + "images/wechat/emoji/2.png"],
			"3": ["[色]", XCV3Config.staticurl + "images/wechat/emoji/3.png"],
			"4": ["[发呆]", XCV3Config.staticurl + "images/wechat/emoji/4.png"],
			"5": ["[得意]", XCV3Config.staticurl + "images/wechat/emoji/5.png"],
			"6": ["[流泪]", XCV3Config.staticurl + "images/wechat/emoji/6.png"],
			"7": ["[害羞]", XCV3Config.staticurl + "images/wechat/emoji/7.png"],
			"8": ["[闭嘴]", XCV3Config.staticurl + "images/wechat/emoji/8.png"],
			"9": ["[睡]", XCV3Config.staticurl + "images/wechat/emoji/9.png"],
			"10": ["[大哭]", XCV3Config.staticurl + "images/wechat/emoji/10.png"],
			"11": ["[尴尬]", XCV3Config.staticurl + "images/wechat/emoji/11.png"],
			"12": ["[发怒]", XCV3Config.staticurl + "images/wechat/emoji/12.png"],
			"13": ["[调皮]", XCV3Config.staticurl + "images/wechat/emoji/13.png"],
			"14": ["[龇牙]", XCV3Config.staticurl + "images/wechat/emoji/14.png"],
			"15": ["[惊讶]", XCV3Config.staticurl + "images/wechat/emoji/15.png"],
			"16": ["[难过]", XCV3Config.staticurl + "images/wechat/emoji/16.png"],
			"17": ["[酷]", XCV3Config.staticurl + "images/wechat/emoji/17.png"],
			"18": ["[冷汗]", XCV3Config.staticurl + "images/wechat/emoji/18.png"],
			"19": ["[抓狂]", XCV3Config.staticurl + "images/wechat/emoji/19.png"],
			"20": ["[吐]", XCV3Config.staticurl + "images/wechat/emoji/20.png"],
			"21": ["[偷笑]", XCV3Config.staticurl + "images/wechat/emoji/21.png"],
			"22": ["[冷酷]", XCV3Config.staticurl + "images/wechat/emoji/22.png"],
			"23": ["[白眼]", XCV3Config.staticurl + "images/wechat/emoji/23.png"],
			"24": ["[傲慢]", XCV3Config.staticurl + "images/wechat/emoji/24.png"],
			"25": ["[饥饿]", XCV3Config.staticurl + "images/wechat/emoji/25.png"],
			"26": ["[困]", XCV3Config.staticurl + "images/wechat/emoji/26.png"],
			"27": ["[惊恐]", XCV3Config.staticurl + "images/wechat/emoji/27.png"],
			"28": ["[流汗]", XCV3Config.staticurl + "images/wechat/emoji/28.png"],
			"29": ["[憨笑]", XCV3Config.staticurl + "images/wechat/emoji/29.png"],
			"30": ["[大兵]", XCV3Config.staticurl + "images/wechat/emoji/30.png"],
			"31": ["[奋斗]", XCV3Config.staticurl + "images/wechat/emoji/31.png"],
			"32": ["[咒骂]", XCV3Config.staticurl + "images/wechat/emoji/32.png"],
			"33": ["[疑问]", XCV3Config.staticurl + "images/wechat/emoji/33.png"],
			"34": ["[嘘]", XCV3Config.staticurl + "images/wechat/emoji/34.png"],
			"35": ["[晕]", XCV3Config.staticurl + "images/wechat/emoji/35.png"],
			"36": ["[折磨]", XCV3Config.staticurl + "images/wechat/emoji/36.png"],
			"37": ["[哀]", XCV3Config.staticurl + "images/wechat/emoji/37.png"],
			"38": ["[骷髅]", XCV3Config.staticurl + "images/wechat/emoji/38.png"],
			"39": ["[敲打]", XCV3Config.staticurl + "images/wechat/emoji/39.png"],
			"40": ["[再见]", XCV3Config.staticurl + "images/wechat/emoji/40.png"],
			"41": ["[擦汗]", XCV3Config.staticurl + "images/wechat/emoji/41.png"],
			"42": ["[抠鼻]", XCV3Config.staticurl + "images/wechat/emoji/42.png"],
			"43": ["[鼓掌]", XCV3Config.staticurl + "images/wechat/emoji/43.png"],
			"44": ["[糗大了]", XCV3Config.staticurl + "images/wechat/emoji/44.png"],
			"45": ["[坏笑]", XCV3Config.staticurl + "images/wechat/emoji/45.png"],
			"46": ["[左哼哼]", XCV3Config.staticurl + "images/wechat/emoji/46.png"],
			"47": ["[右哼哼]", XCV3Config.staticurl + "images/wechat/emoji/47.png"],
			"48": ["[哈欠]", XCV3Config.staticurl + "images/wechat/emoji/48.png"],
			"49": ["[鄙视]", XCV3Config.staticurl + "images/wechat/emoji/49.png"],
			"50": ["[委屈]", XCV3Config.staticurl + "images/wechat/emoji/50.png"],
			"51": ["[快哭了]", XCV3Config.staticurl + "images/wechat/emoji/51.png"],
			"52": ["[阴险]", XCV3Config.staticurl + "images/wechat/emoji/52.png"],
			"53": ["[亲亲]", XCV3Config.staticurl + "images/wechat/emoji/53.png"],
			"54": ["[吓]", XCV3Config.staticurl + "images/wechat/emoji/54.png"],
			"55": ["[可怜]", XCV3Config.staticurl + "images/wechat/emoji/55.png"],
			"56": ["[菜刀]", XCV3Config.staticurl + "images/wechat/emoji/56.png"],
			"57": ["[西瓜]", XCV3Config.staticurl + "images/wechat/emoji/57.png"],
			"58": ["[啤酒]", XCV3Config.staticurl + "images/wechat/emoji/58.png"],
			"59": ["[篮球]", XCV3Config.staticurl + "images/wechat/emoji/59.png"],
			"60": ["[乒乓]", XCV3Config.staticurl + "images/wechat/emoji/60.png"],
			"61": ["[咖啡]", XCV3Config.staticurl + "images/wechat/emoji/61.png"],
			"62": ["[饭]", XCV3Config.staticurl + "images/wechat/emoji/62.png"],
			"63": ["[猪头]", XCV3Config.staticurl + "images/wechat/emoji/63.png"],
			"64": ["[玫瑰]", XCV3Config.staticurl + "images/wechat/emoji/64.png"],
			"65": ["[凋谢]", XCV3Config.staticurl + "images/wechat/emoji/65.png"],
			"66": ["[示爱]", XCV3Config.staticurl + "images/wechat/emoji/66.png"],
			"67": ["[爱心]", XCV3Config.staticurl + "images/wechat/emoji/67.png"],
			"68": ["[心碎]", XCV3Config.staticurl + "images/wechat/emoji/68.png"],
			"69": ["[蛋糕]", XCV3Config.staticurl + "images/wechat/emoji/69.png"],
			"70": ["[闪电]", XCV3Config.staticurl + "images/wechat/emoji/70.png"],
			"71": ["[炸弹]", XCV3Config.staticurl + "images/wechat/emoji/71.png"],
			"72": ["[刀]", XCV3Config.staticurl + "images/wechat/emoji/72.png"],
			"73": ["[足球]", XCV3Config.staticurl + "images/wechat/emoji/73.png"],
			"74": ["[瓢虫]", XCV3Config.staticurl + "images/wechat/emoji/74.png"],
			"75": ["[便便]", XCV3Config.staticurl + "images/wechat/emoji/75.png"],
			"76": ["[月亮]", XCV3Config.staticurl + "images/wechat/emoji/76.png"],
			"77": ["[太阳]", XCV3Config.staticurl + "images/wechat/emoji/77.png"],
			"78": ["[礼物]", XCV3Config.staticurl + "images/wechat/emoji/78.png"],
			"79": ["[拥抱]", XCV3Config.staticurl + "images/wechat/emoji/79.png"],
			"80": ["[强]", XCV3Config.staticurl + "images/wechat/emoji/80.png"],
			"81": ["[弱]", XCV3Config.staticurl + "images/wechat/emoji/81.png"],
			"82": ["[握手]", XCV3Config.staticurl + "images/wechat/emoji/82.png"],
			"83": ["[胜利]", XCV3Config.staticurl + "images/wechat/emoji/83.png"],
			"84": ["[抱拳]", XCV3Config.staticurl + "images/wechat/emoji/84.png"],
		},
		emotionDataIndexs: {
			"[微笑]": 1,
			"[撇嘴]": 2,
			"[色]": 3,
			"[发呆]": 4,
			"[得意]": 5,
			"[流泪]": 6,
			"[害羞]": 7,
			"[闭嘴]": 8,
			"[睡]": 9,
			"[大哭]": 10,
			"[尴尬]": 11,
			"[发怒]": 12,
			"[调皮]": 13,
			"[龇牙]": 14,
			"[惊讶]": 15,
			"[难过]": 16,
			"[酷]": 17,
			"[冷汗]": 18,
			"[抓狂]": 19,
			"[吐]": 20,
			"[偷笑]": 21,
			"[冷酷]": 22,
			"[白眼]": 23,
			"[傲慢]": 24,
			"[饥饿]": 25,
			"[困]": 26,
			"[惊恐]": 27,
			"[流汗]": 28,
			"[憨笑]": 29,
			"[大兵]": 30,
			"[奋斗]": 31,
			"[咒骂]": 32,
			"[疑问]": 33,
			"[嘘]": 34,
			"[晕]": 35,
			"[折磨]": 36,
			"[哀]": 37,
			"[骷髅]": 38,
			"[敲打]": 39,
			"[再见]": 40,
			"[擦汗]": 41,
			"[抠鼻]": 42,
			"[鼓掌]": 43,
			"[糗大了]": 44,
			"[坏笑]": 45,
			"[左哼哼]": 46,
			"[右哼哼]": 47,
			"[哈欠]": 48,
			"[鄙视]": 49,
			"[委屈]": 50,
			"[快哭了]": 51,
			"[阴险]": 52,
			"[亲亲]": 53,
			"[吓]": 54,
			"[可怜]": 55,
			"[菜刀]": 56,
			"[西瓜]": 57,
			"[啤酒]": 58,
			"[篮球]": 59,
			"[乒乓]": 60,
			"[咖啡]": 61,
			"[饭]": 62,
			"[猪头]": 63,
			"[玫瑰]": 64,
			"[凋谢]": 65,
			"[示爱]": 66,
			"[爱心]": 67,
			"[心碎]": 68,
			"[蛋糕]": 69,
			"[闪电]": 70,
			"[炸弹]": 71,
			"[刀]": 72,
			"[足球]": 73,
			"[瓢虫]": 74,
			"[便便]": 75,
			"[月亮]": 76,
			"[太阳]": 77,
			"[礼物]": 78,
			"[拥抱]": 79,
			"[强]": 80,
			"[弱]": 81,
			"[握手]": 82,
			"[胜利]": 83,
			"[抱拳]": 84
		},
		//获取文件后缀
		getfileExtension: function (filename) {
			return filename.substring(filename.lastIndexOf("."))
		},
		emoToimg: function (txt) {
			if (!txt) return '';
			var e = this;
			var patternemoji = /\[[\u4e00-\u9fa5]+\]/g;
			return txt.replace(patternemoji, function (match) {
				if (e.emotionDataIndexs[match]) {
					return '<img src="' + e.emotions[e.emotionDataIndexs[match]][1] + '" class="faceImg" />'
				}
			})
		},
		timeTostring: function (time, type) {
			var type = type || false;
			var now = new Date(time * 1000);
			var year = now.getFullYear();
			var month = now.getMonth() + 1;
			var date = now.getDate();
			var hour = now.getHours();
			var minute = now.getMinutes();
			var second = now.getSeconds();
			if (type) {
				return year + '-' + (month < 10 ? '0' + month : month) + "-" + (date < 10 ? '0' + date : date) + "   " + (hour < 10 ? '0' + hour : hour) + ":" + (minute < 10 ? '0' + minute : minute) + ":" + (second < 10 ? '0' + second : second);
			} else {
				return (month < 10 ? '0' + month : month) + "-" + (date < 10 ? '0' + date : date) + "   " + (hour < 10 ? '0' + hour : hour) + ":" + (minute < 10 ? '0' + minute : minute) + ":" + (second < 10 ? '0' + second : second);
			}
		},
		timeTostring2: function ($str = '') {
			return $str.replace(/^(\d{4})(\d{2})(\d{2})(\d{2})(\d{2})(\d{2})$/, "$1-$2-$3 $4:$5:$6");
		},
		getQueryString: function (key) {
			return this.getParas(key);
		},
		getParas: function (name) {
			var result = location.search.match(new RegExp("[\?\&]" + name + "=([^\&]+)", "i"));
			if (result == null || result.length < 1) {
				return "";
			}
			return result[1];
		},
		ajaxSubmit: function (url, params, tip, isfile) {
			tip = tip || false;
			isfile = isfile || false;
			var self = this;
			if (tip) var layindex = self.showLoading(tip);
			var obj = {
				url: self.makeurl(url),
				type: 'post',
				data: params,
				dataType: 'json'
			};
			if (isfile) {
				obj.processData = false; // 使数据不做处理
				obj.contentType = false; // 不要设置Content-Type请求头
			}
			var ajaxObj = $.Deferred();
			$.ajax(obj).then(function (json, status, xhr) {
				if (tip) self.close(layindex);
				if (json.code == -100) {
					self.showMsg(json.msg);
					setTimeout(function () {
						window.location.reload();
					}, 2e3);
				} else {
					ajaxObj.resolve(json, status, xhr);
				}
			}, function (json) {
				if (tip) self.close(layindex);
				ajaxObj.reject(json);
			});
			return ajaxObj.promise();
		},
		ajaxhtmlSubmit: function (url, params, tip) {
			var tip = tip || false;
			var self = this;
			if (tip) var layindex = self.showLoading(tip);
			var ajaxObj = $.Deferred();
			$.ajax({
				url: self.makeurl(url),
				type: 'post',
				data: params,
				dataType: 'html'
			}).then(function (html) {
				if (tip) self.close(layindex);
				ajaxObj.resolve(html);
			}, function (html) {
				if (tip) self.close(layindex);
				ajaxObj.reject(html);
			});
			return ajaxObj.promise();
		},
		makeurl: function (r) {
			return r;
		},
		tpl: function (dom, data) {
			return laytpl(dom.html()).render(data);
		},
		random: function (nums, upper, onlyzm) {
			upper = upper || false;
			onlyzm = onlyzm || false;
			if (onlyzm) {
				var str = "", arr = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z'];
				if (upper) {
					var arr2 = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z'];
					arr = arr.concat(arr2);
				}
			} else {
				var str = "", arr = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', 'a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z'];
				if (upper) {
					var arr2 = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z'];
					arr = arr.concat(arr2);
				}
			}
			for (var i = 0; i < nums; i++) {
				pos = Math.round(Math.random() * (arr.length - 1));
				str += arr[pos];
			}
			return str;
		},
		serializeObject: function (obj) {
			var o = {};
			var a = obj.serializeArray();
			$.each(a, function () {
				if (o[this.name]) {
					if (!o[this.name].push) {
						o[this.name] = [o[this.name]];
					}
					o[this.name].push(this.value || '');
				} else {
					o[this.name] = this.value || '';
				}
			});
			return o;
		},
		showMsg: function (txt) {
			layer.msg(txt);
		},
		showConfirm: function (title, content, btns, fuc, fuc2) {
			var fuc = fuc || false;
			var fuc2 = fuc2 || false;
			layer.confirm(content, {
				title: title,
				closeBtn: 0,
				shade: 0.6,
				anim: 0,
				move: false,
				btn: btns,
				resize: false,
				zIndex: '99999999999',
				btnAlign: 'c'
			}, function (index) {
				layer.close(index);
				if (fuc) {
					fuc();
				}
			}, function (index) {
				layer.close(index);
				if (fuc2) {
					fuc2();
				}
			});
		},
		showLoading: function (txt) {
			var layIndex = layer.msg(txt, {
				icon: 16,
				shade: 0.01,
				time: 0,
				shade: [0.8, '#393D49']
			});
			return layIndex;
		},
		showImgpreview: function (src, area, imgcss) {
			var imgcss = imgcss || false;
			var imgObj = {
				type: 1,
				shade: false,
				title: false,
				move: false,
				area: area,
				resize: false,
			}
			if (imgcss) {
				imgObj.content = "<img src='" + src + "' style=" + imgcss + " />";
			} else {
				imgObj.content = "<img src='" + src + "'  />";
			}
			layer.open(imgObj);
		},
		showPhotos: function (data, type) {
			type = type || '1';
			if (type == '1') {
				var json = {
					"title": "",
					"id": 123,
					"start": 0,
					"data": data,
				};
			} else {
				var json = data;
			}
			layer.photos({
				photos: json
				, anim: 5
			});
		},
		uploadStsFile: function (params, func, pfunc) {
			var self = this, file = params.file, amtype = params.amtype, filetype = (params.filetype == '1' ? 'image' : (params.filetype == '2' ? 'audio' : 'video')), filetypename = (params.filetype == '1' ? '图片' : (params.filetype == '2' ? '音频' : '视频')), issucaiku = params.issucaiku || '2';
			var appmaxsize = XCV3Config.amconfig[filetype].size || 2048, appexts = XCV3Config.amconfig[filetype].ext || 'jpg,jpeg,png,gif';
			if (file.size == 0) {
				func && func({ code: '-1', msg: '请选择文件' });
				return false;
			}
			if (file.size > appmaxsize * 1024) {
				func && func({ code: '-1', msg: '只能上传' + parseFloat(appmaxsize / 1024).toFixed(2) + 'M内的' + filetypename + '文件' });
				return false;
			}
			var date = new Date();
			var year = date.getFullYear();
			var month = date.getMonth() + 1;
			if (month.length == 1) {
				month = '0' + month;
			}
			var mime = file.ext.toLowerCase();
			var filepath = "attachment/web/" + filetype + "s/" + (issucaiku == '1' ? 'sucaiku' : '0') + "/" + year + '/' + month + '/' + self.random(32, true) + '.' + mime;
			if (appexts.indexOf(mime) == -1) {
				func && func({ code: '-1', msg: '只能上传' + appexts + '格式的' + filetypename + '文件' });
				return false;
			}
			var savedata = {
				filetype: params.filetype,
				filepath: filepath,
				filename: file.name,
				issucaiku: issucaiku,
				fcateid: (params.fcateid || '0'),
				cateid: (params.cateid || '0'),
			};
			self.ajaxSubmit('/common/sts/getsts', { type: amtype }).then(function (json) {
				if (json.code == 0) {
					if (amtype == '1') {
						var client = new directup(json.msg);
						async function putObject() {
							try {
								var result = await client.multipartUpload(
									filepath,
									file.source.source,
									{
										progress: function (p, cpt, res) {
											pfunc && pfunc(Math.round(p * 100));
										},
									},
								);
								self.filepathsave(savedata, func);
							} catch (e) {
								func && func({ code: '-1', msg: '上传出现异常，请稍后重试' });
							}
						}
						putObject();
					} else if (amtype == '2') {
						var credentials = json.msg, url = 'https://' + credentials.bucket + '.cos.' + credentials.region + '.myqcloud.com/' + self.camSafeUrlEncode(filepath).replace(/%2F/g, '/'), xhr = new XMLHttpRequest();
						xhr.open('PUT', url, true);
						xhr.setRequestHeader('Authorization', window.CosAuth({
							SecretId: credentials.key,
							SecretKey: credentials.secret,
							Method: 'PUT',
							Pathname: '/' + filepath,
						}));
						xhr.setRequestHeader('x-cos-security-token', credentials.token);
						xhr.upload.onprogress = function (e) {
							pfunc && pfunc((Math.round(e.loaded / e.total * 10000) / 100));
						};
						xhr.onload = function () {
							if (/^2\d\d$/.test('' + xhr.status)) {
								self.filepathsave(savedata, func);
							} else {
								func && func({ code: '-1', msg: '文件上传失败，状态码：' + xhr.status });
							}
						};
						xhr.onerror = function (err) {
							func && func({ code: '-1', msg: '文件上传失败，请检查是否没配置 CORS 跨域规则' });
						};
						xhr.send(file.source.source);
					} else {
						var observable = directup.upload(file.source.source, filepath, json.msg, {
							customVars: { "x:name": filepath.split('.')[0] }
						}, {
							checkByServer: true,
							checkByMD5: true,
							forceDirect: false,
							disableStatisticsReport: false,
							retryCount: 6,
							debugLogLevel: 'INFO'
						});
						var subscription = observable.subscribe({
							next: function (response) {
								pfunc && pfunc(Math.round(response.total.percent));
							},
							error: function (err) {
								subscription.unsubscribe();
								func && func({ code: '-1', msg: '上传出错' });
							},
							complete: function (res) {
								subscription.unsubscribe();
								self.filepathsave(savedata, func);
							}
						});
					}
				} else {
					func && func(json);
				}
			}, function () {
				func && func({ code: '-1', msg: '上传出错' });
			});
		},
		filepathsave: function (params, func) {
			var self = this, filetype = params.filetype || '1';
			var data = {
				isweb: '1',
				issucaiku: params.issucaiku,
				fromtype: 'web',
				filetype: filetype,
				filename: params.filename,
				filepath: params.filepath,
				fcateid: (params.fcateid || '0'),
				cateid: (params.cateid || '0'),
			};
			if (filetype < 3) {
				self.ajaxSubmit('/common/attachment/savestsfile', data).then(function (json) {
					func && func(json);
				}, function () {
					func && func({ code: '-1', msg: '上传出错' });
				});
			} else {

				self.ajaxSubmit('/common/attachment/snapshotstsfile', data).then(function (json) {
					func && func(json);
				}, function () {
					func && func({ code: '-1', msg: '上传出错' });
				});
			}
		},
		camSafeUrlEncode: function (str) {
			return encodeURIComponent(str)
				.replace(/!/g, '%21')
				.replace(/'/g, '%27')
				.replace(/\(/g, '%28')
				.replace(/\)/g, '%29')
				.replace(/\*/g, '%2A');
		},
		videoswiper: null,
		showVideos: function (data, type, css) {
			type = type || '3';
			if (data == null || data.length == 0) return;
			var self = this;
			if (self.videoswiper && (self.videoswiper.hasOwnProperty('destory') || ('destory' in self.videoswiper))) {
				self.videoswiper.destroy();
			}
			var html = '<div class="videopreviewBox zam-flex-center" style=' + css + '><div class="videopreivewCover"><i class="mdi mdi-close"></i></div><div class="swiper-container swiper-videos">';
			html += '<div class="swiper-wrapper zam-flex zam-alignItems">';
			$.each(data, function (i, v) {
				if (type == '3') {
					html += '<div class="swiper-slide"><video src="' + v + '" controls controlsList="nodownload" disablePictureInPicture></video></div>';
				} else if (type == '2') {
					html += '<div class="swiper-slide"><audio src="' + v + '" controls controlsList="nodownload" disablePictureInPicture></audio></div>';
				} else {
					html += '<div class="swiper-slide" ><img src="' + v + '" style="border:1px solid #fff;border-radius:5px;max-height:600px"></div>';
				}
			});
			html += '</div>';
			html += '<div class="swiper-pagination"></div>';
			html += '<div class="swiper-button-prev swiper-button-white"></div>';
			html += '<div class="swiper-button-next swiper-button-white"></div>';
			html += '</div></div>';
			$("body").append(html);
			self.videoswiper = new Swiper('.swiper-videos', {
				watchOverflow: true,
				navigation: {
					nextEl: '.swiper-button-next',
					prevEl: '.swiper-button-prev',
				},
				pagination: {
					el: '.swiper-pagination',
				},
			});
			if (data.length == 1 && type > 1) {
				if (type == '2') {
					$(".swiper-videos audio").off('canplay').on("canplay", function () {
						$(this)[0].play();
					});
				} else if (type == '3') {
					$(".swiper-videos video").off('canplay').on("canplay", function () {
						$(this)[0].play();
					});
				}
			}
			//$('.videopreviewBox').bind('contextmenu',function() { return false; });
			$("body").off('click').on('click', '.videopreivewCover', function () {
				if (data.length == 1 && type > 1) {
					if (type == '2') {
						if ($(".swiper-videos audio").length > 0) $(".swiper-videos audio")[0].pause();
					} else if (type == '3') {
						if ($(".swiper-videos video").length > 0) $(".swiper-videos video")[0].pause();
					}
				}
				setTimeout(function () {
					$('.videopreivewCover').remove();
					//$('.videopreviewBox').unbind('contextmenu');
					$(".videopreviewBox").remove();
					if (self.videoswiper && (self.videoswiper.hasOwnProperty('destory') || ('destory' in self.videoswiper))) {
						self.videoswiper.destroy();
					}
					self.videoswiper = null;
				});
			});
		},
		showTips: function (txt, dom, direction, func) {
			var func = func || false;
			var layindex = layer.tips(txt, dom, {
				tips: direction || 1,
				time: -1,
				success: function (e, a) {
					func && func(e, a);
				}
			});
			$(dom).data('index', layindex);
		},
		dzqyFullpage: function (obj, bgimg, fn) {
			var self = this, deviceid = obj.attr("data-clientid"), width = obj.attr("data-width"), height = obj.attr("data-height"), toppos = obj.attr("data-toppos"), leftpos = obj.attr("data-leftpos"), needfly = obj.attr("data-needfly"), flytoppos = obj.attr("data-ftoppos"), flyleftpos = obj.attr("data-fleftpos"), isfullshow = false;
			layer.open({
				type: 1,
				title: false,
				scrollbar: false,
				closeBtn: false,
				resize: false,
				area: ['100%', '100%'],
				shade: 0,
				content: "<div class='pagefullBox' style='position:absolute;top:0;left:0;width:100%;height:100%;background-image:url(" + bgimg + ");background-size:100% 100%;background-repeat:no-repeat'><span class='pagecloseall mdi mdi-close' title='保存'></span><span class='pagefullscreen mdi mdi-fullscreen' title='全屏'></span></div>",
				success: function (layero) {
					var zoom = (window.innerHeight / 800).toFixed(2);
					var ls = layer.open({
						type: 1,
						needresize: false,
						title: ['<span>签名区域，鼠标放置此处可以拖动</span>', 'color:red'],
						closeBtn: 0,
						shade: 0,
						skin: 'drawlaybox',
						area: [width, height],
						offset: [toppos, leftpos],
						content: '<div class="zam-flex-column-center" style="height:100%;font-size:20px;"><div>签名区域</div><div class="text-error" style="font-size:10px;padding:10px;">签名区域太小可能导致签名显示不完整，请合理设置大小以及笔迹缩放比</div></div>',
						resize: true,
						resizing: function (lay) {
							layer.style(le, { width: $(lay).css('width'), height: $(lay).css('height') });
						},
						moveOut: true,
						zIndex: layer.zIndex,
						success: function (layero) {
							layer.setTop(layero);
							$(layero).css({ "zoom": (window.innerHeight / 800).toFixed(2) });
						}
					});
					var le = layer.open({
						type: 1,
						needresize: false,
						title: ['<span>落点区域，鼠标放置此处可以拖动至合适位置</span>', 'color:blue'],
						closeBtn: 0,
						shade: 0,
						skin: 'flylaybox',
						area: [width, height],
						offset: [flytoppos, flyleftpos],
						content: '<p class="zam-flex-center" style="height:100%;font-size:20px;">签名落点<div class="needflyBox zam-flex"><span class="m-r-10">开启落点:</span><label class="lyear-switch switch-primary normal-swith switch-solid"><input type="checkbox" ' + (needfly == '1' ? 'checked' : '') + '><span></span></div></p>',
						resize: false,
						moveOut: true,
						zIndex: layer.zIndex,
						success: function (layero) {
							layer.setTop(layero);
							$(layero).css({ "zoom": (window.innerHeight / 800).toFixed(2) });
							$(".needflyBox input").change(function () {
								needfly = $(this).is(":checked") ? "1" : "2";
							});
						}
					});
					$(layero).find(".pagecloseall").on('click', function () {
						self.showConfirm('警告', '是否保存本次修改?', ['保存', '放弃'], function () {
							fn && fn({ w: $(".drawlaybox").css("width"), h: $(".drawlaybox").css("height"), l: $(".drawlaybox").css("left"), t: $(".drawlaybox").css("top"), needfly: needfly, fl: $(".flylaybox").css("left"), ft: $(".flylaybox").css("top") });
						}, function () {
							layer.closeAll();
						});
					});
					$(layero).find(".pagefullscreen").on('click', function () {
						isfullshow ? (self.exitFullScreen(), isfullshow = false) : (self.fullScreen(), isfullshow = true);
					});
					$(window).on('resize', function () {
						$(".drawlaybox,.flylaybox").css({ "zoom": (window.innerHeight / 800).toFixed(2) });
					});
				},
			});
		},
		fullScreen: function () {
			var el = document.documentElement;
			var rfs = el.requestFullScreen || el.webkitRequestFullScreen;
			if (typeof rfs != "undefined" && rfs) {
				rfs.call(el);
			} else if (typeof window.ActiveXObject != "undefined") {
				var wscript = new ActiveXObject("WScript.Shell");
				if (wscript != null) {
					wscript.SendKeys("{F11}");
				}
			} else if (el.msRequestFullscreen) {
				el.msRequestFullscreen();
			} else if (el.oRequestFullscreen) {
				el.oRequestFullscreen();
			} else {
				alert('浏览器不支持全屏,按F11键切换全屏');
			}
		},
		exitFullScreen: function () {
			var el = document;
			var cfs = el.cancelFullScreen || el.webkitCancelFullScreen || el.exitFullScreen;
			if (typeof cfs != "undefined" && cfs) {
				cfs.call(el);
			} else if (typeof window.ActiveXObject != "undefined") {
				var wscript = new ActiveXObject("WScript.Shell");
				if (wscript != null) {
					wscript.SendKeys("{F11}");
				}
			} else if (el.msExitFullscreen) {
				el.msExitFullscreen();
			} else if (el.oRequestFullscreen) {
				el.oCancelFullScreen();
			} else {
				alert('浏览器不支持全屏,按F12键切换全屏');
			}
		},
		closeLayer: function () {
			layer.closeAll();
		},
		close: function (index) {
			layer.close(index);
		},
		countdown: function (time, lg, draw, jgtime) {
			var b = setInterval(function () {
				time = time - 1;
				if (time > 0) {//>0
					if (lg) {
						lg(time);
					}
				} else {
					clearInterval(b);
					if (draw) {
						draw()
					}
				}
			}, jgtime || 1e3);
			return b;
		},
		/*取出2个数组相同部分*/
		getArrEqual: function (arr1, arr2) {
			var newArr = [];
			for (var i = 0; i < arr2.length; i++) {
				for (var j = 0; j < arr1.length; j++) {
					if (arr1[j] === arr2[i]) {
						newArr.push(arr1[j]);
					}
				}
			}
			return newArr;
		},
		/*后台导入xls*/
		importxls: function (tplobj, func) {
			tplobj.filetype = tplobj.filetype || 'xls';
			var self = this;
			require(['jconfirmBox', 'zamnotice'], function (jconfirmBox, zamnotice) {
				var confirmobj = jconfirmBox.confirm(tplobj.title, self.tpl($("#importxls-tpl"), tplobj), function (e) {
					var formData = new FormData();
					var name = e.$content.find(".xlsfile").val();
					formData.append("file", e.$content.find(".xlsfile")[0].files[0]);
					formData.append("name", name);
					if (name == '') {
						return zamnotice.showTips('error', '请上传' + tplobj.filetype + '文件');
					} else {
						self.ajaxSubmit(tplobj.url, formData, '正在同步文件内容，请稍候..', true).then(function (json) {
							if (json.code == 0) {
								confirmobj.close();
								zamnotice.showTips('success', tplobj.filetype == 'xls' ? '导入成功' : "上传成功");
								func && func(json.msg);
							} else {
								zamnotice.showTips('error', json.msg);
							}
						}, function () {
							zamnotice.showTips('error', '文件内容异常');
						});
					}
				}, false, false, true, [{ 'hidden': false, 'txt': tplobj.filetype == 'xls' ? '确定导入' : "确定上传" }, { 'hidden': false, 'txt': '取消' }]);
			});
		},
		filterStr: function (str, type) {
			if (typeof (str) == 'string') {
				type = type || '1';
				if (type == '2') {
					//去掉转义字符
					str = str.replace(/[\'\"\\\/\b\f\n\r\t]/g, '');
				} else if (type == '3') {
					//去掉特殊字符
					str = str.replace(/[\@\#\$\%\^\&\*\(\)\{\}\:\"\L\<\>\?\[\]]/g, '');
				} else {
					//全部去掉
					str = str.replace(/[\'\"\\\/\b\f\n\r\t]/g, '');
					str = str.replace(/[\@\#\$\%\^\&\*\(\)\{\}\:\"\L\<\>\?\[\]]/g, '');
				}
			}
			return str;
		},
		/*修复浮点型 tofixed不准确的问题 此方法遇到整数并不会后面添加0*/
		toFixed: function (v, s) {
			//const adjust = v >= 0 ? 0.5 : -0.5;
			//return (parseInt(v * Math.pow( 10, s ) + adjust)/ Math.pow( 10, s )).toString();
			const formatter = new Intl.NumberFormat('en-US', {
				minimumFractionDigits: s,
				maximumFractionDigits: s,
				useGrouping: false
			})
			return formatter.format(v)
		},
	};
	return webcore;
});