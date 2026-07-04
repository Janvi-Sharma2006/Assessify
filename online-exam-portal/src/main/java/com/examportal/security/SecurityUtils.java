package com.examportal.security;

import org.springframework.security.core.context.SecurityContextHolder;

public class SecurityUtils {

    public static UserPrincipal getCurrentUser() {
        return (UserPrincipal) SecurityContextHolder.getContext()
                .getAuthentication()
                .getPrincipal();
    }

    public static Long getCurrentUserId() {
        return getCurrentUser().getUser().getId();
    }

    public static String getCurrentUserRole() {
        return getCurrentUser().getUser().getRole();
    }

    public static boolean isAdmin() {
        return "ADMIN".equals(getCurrentUserRole());
    }
}