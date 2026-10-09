package com.devmeetscribe.backend.util;

import java.util.Locale;
import java.util.Set;

public final class TextUtils {

    private static final Set<String> EMPTY_MARKERS =
            Set.of("null", "none", "n/a", "na", "unknown", "unassigned", "not specified", "not mentioned");

    private TextUtils() {
    }

    /** Trims; returns null for blank text or placeholder words an LLM tends to emit. */
    public static String blankToNull(String value) {
        if (value == null) {
            return null;
        }
        String trimmed = value.trim();
        if (trimmed.isEmpty() || EMPTY_MARKERS.contains(trimmed.toLowerCase(Locale.ROOT))) {
            return null;
        }
        return trimmed;
    }
}
