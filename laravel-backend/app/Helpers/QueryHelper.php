<?php

namespace App\Helpers;

class QueryHelper
{
    /**
     * Escape special LIKE/ILIKE wildcard characters in user input.
     * Prevents wildcard injection in PostgreSQL LIKE/ILIKE queries.
     */
    public static function escapeLike(string $value): string
    {
        return str_replace(
            ['\\', '%', '_'],
            ['\\\\', '\\%', '\\_'],
            $value
        );
    }
}
