<?php

return [
    'aeskey' => getenv('APP_AES_KEY') ?: '',
    'ivkey' => getenv('APP_AES_IV') ?: '',
];
