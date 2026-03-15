package com.wellnest.controller;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;

@Controller
public class SpaForwardingController {

    @RequestMapping({
            "/",
            "/login",
            "/signup",
            "/verify-email",
            "/user-profile",
            "/profile",
            "/home",
            "/settings",
            "/friends",
            "/forgot-password",
            "/reset-password",
            "/water-intake",
            "/sleep-logs",
            "/workout-tracker",
            "/meal-tracker"
    })
    public String forwardSpaRoutes() {
        return "forward:/index.html";
    }
}
