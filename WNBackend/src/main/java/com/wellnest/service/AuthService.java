package com.wellnest.service; 

import com.wellnest.model.User; 
import com.wellnest.model.LoginRequest; 
import com.wellnest.model.SignupRequest; 
import com.wellnest.model.AuthResponse; 
import com.wellnest.repository.UserRepository; 
import org.springframework.security.crypto.password.PasswordEncoder; // import password encoder
import org.springframework.stereotype.Service; // import service annotation
import com.mongodb.MongoWriteException; // import mongo write exception

import java.time.LocalDateTime; 
import java.util.Optional; 
import java.util.Random;

@Service 
public class AuthService { 

    private final UserRepository userRepository; 
    private final PasswordEncoder passwordEncoder; 
    private final JwtService jwtService; // jwt service dependency
    private final EmailService emailService; // email service dependency

    public AuthService(UserRepository userRepository, 
                       PasswordEncoder passwordEncoder,
                       JwtService jwtService,
                       EmailService emailService) { 
        this.userRepository = userRepository; 
        this.passwordEncoder = passwordEncoder; 
        this.jwtService = jwtService; 
        this.emailService = emailService; 
    } 

    public AuthResponse signup(SignupRequest request) { // handle signup logic
        System.out.println("SIGNUP API HIT"); // log request entry

        if (userRepository.existsByEmail(request.getEmail())) { // check email uniqueness
            return new AuthResponse(null, null, null, "Email already registered"); // return conflict response
        } 

        if (userRepository.existsByUsername(request.getUsername())) { // check username uniqueness
            return new AuthResponse(null, null, null, "Username already taken"); // return conflict response
        } 

        User user = new User(); // create new user entity
        user.setFullName(request.getFullName()); 
        user.setEmail(request.getEmail()); 
        user.setUsername(request.getUsername()); 
        user.setPassword(passwordEncoder.encode(request.getPassword())); // hash and set password
        user.setPhoneNumber(request.getPhoneNumber());
        user.setGender(request.getGender());
        user.setCreatedAt(LocalDateTime.now()); 
        user.setUpdatedAt(LocalDateTime.now()); 
        user.setActive(false); // require email verification

        String otp = generateOtp(); // generate verification code
        user.setVerificationCode(otp); // store verification code
        user.setVerificationExpiry(LocalDateTime.now().plusMinutes(15)); // set verification expiry

        try { 
            userRepository.save(user); 
        } catch (MongoWriteException e) { // catch duplicate key errors
            if (e.getError().getCategory().name().equals("DUPLICATE_KEY")) {
                return new AuthResponse(null, null, null, "Email or username already registered"); 
            } 
            throw e; // rethrow other errors
        }

        try { // begin email send attempt
            emailService.sendVerificationEmail(user.getEmail(), otp); // send verification email
        } catch (Exception ex) { // handle email errors
            userRepository.delete(user); // rollback user on email failure
            throw new IllegalStateException("Failed to send verification email", ex); // propagate failure
        } 
        return new AuthResponse(null, user.getEmail(), user.getFullName(), "Signup successful. Please verify your email to activate your account."); 
    } 

    public AuthResponse sendVerification(String email) { // resend verification code
        Optional<User> userOptional = userRepository.findByEmail(email); // lookup user by email
        if (userOptional.isEmpty()) { // handle missing user
            return new AuthResponse(null, null, null, "No account found for this email"); 
        } 

        User user = userOptional.get(); // unwrap user
        if (user.isActive()) { // skip already verified accounts
            return new AuthResponse(null, user.getEmail(), user.getFullName(), "Account already verified. Please login.");
        }
        String otp = generateOtp(); // generate new code
        user.setVerificationCode(otp); // set new code
        user.setVerificationExpiry(LocalDateTime.now().plusMinutes(15)); // set new expiry
        userRepository.save(user); // persist new code

        try { // begin email send attempt
            emailService.sendVerificationEmail(user.getEmail(), otp); // send verification email
        } catch (Exception ex) { // handle send errors
            ex.printStackTrace(); // log error
            return new AuthResponse(null, null, null, "Failed to send verification email"); 
        } 

        return new AuthResponse(null, user.getEmail(), user.getFullName(), "Verification code sent to email"); // return success response
    } 

    public AuthResponse login(LoginRequest request) { // handle login logic

        Optional<User> userOptional = userRepository.findByUsername(request.getUsername()); // lookup user by username

        if (userOptional.isEmpty()) { // handle missing user
            return new AuthResponse(null, null, null, "Invalid username or password"); // return auth failure
        } 

        User user = userOptional.get(); // unwrap user

        if (!user.isActive()) { // check email verification status
            return new AuthResponse(null, null, null, "Account is not verified. Please verify your email."); 
        } 

        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) { // validate password
            return new AuthResponse(null, null, null, "Invalid username or password"); 
        } 

        String token = jwtService.generateToken(user.getUsername()); // create jwt token

        return new AuthResponse(token, user.getEmail(), user.getFullName(), "Login successful"); // return login response
    } 

    public AuthResponse verifyEmail(String email, String code) { // verify email with code
        Optional<User> userOptional = userRepository.findByEmail(email); // lookup user by email
        if (userOptional.isEmpty()) { // handle missing user
            return new AuthResponse(null, null, null, "Invalid email or code"); 
        } 

        User user = userOptional.get(); // unwrap user
        if (user.isActive()) { // prevent re-verification
            return new AuthResponse(null, user.getEmail(), user.getFullName(), "Account already verified. Please login.");
        }
        if (user.getVerificationCode() == null || user.getVerificationExpiry() == null) { 
            return new AuthResponse(null, null, null, "No verification code found"); 
        } 

        if (user.getVerificationExpiry().isBefore(LocalDateTime.now())) { // check expiration
            return new AuthResponse(null, null, null, "Verification code expired"); // return expired response
        } 

        if (!user.getVerificationCode().equals(code)) { // validate code match
            return new AuthResponse(null, null, null, "Invalid verification code"); 
        } 

        user.setActive(true); // activate account
        user.setVerificationCode(null); // clear verification code
        user.setVerificationExpiry(null); // clear verification expiry
        userRepository.save(user); // persist activation

        String token = jwtService.generateToken(user.getUsername()); // create jwt token
        return new AuthResponse(token, user.getEmail(), user.getFullName(), "Email verified; account activated"); 
    } 

    public AuthResponse forgotPassword(String email) { // start password reset flow
        Optional<User> userOptional = userRepository.findByEmail(email); // lookup user by email
        if (userOptional.isEmpty()) { // hide account existence
            return new AuthResponse(null, null, null, "If this email exists, a reset code has been sent"); // return neutral response
        } 

        User user = userOptional.get(); // unwrap user
        String otp = generateOtp(); // generate reset code
        user.setResetCode(otp); // set reset code
        user.setResetExpiry(LocalDateTime.now().plusMinutes(15)); // set reset expiry
        userRepository.save(user); // persist reset info

        try { // begin email send attempt
            emailService.sendResetEmail(user.getEmail(), otp); 
        } catch (Exception ex) { 
            ex.printStackTrace(); 
        } 

        return new AuthResponse(null, user.getEmail(), user.getFullName(), "If this email exists, a reset code has been sent"); 
    } 

    public AuthResponse resetPassword(String email, String code, String newPassword) { // complete password reset
        Optional<User> userOptional = userRepository.findByEmail(email); // lookup user by email
        if (userOptional.isEmpty()) { // handle missing user
            return new AuthResponse(null, null, null, "Invalid email or code"); 
        } 

        User user = userOptional.get(); // unwrap user
        if (user.getResetCode() == null || user.getResetExpiry() == null) { // check code presence
            return new AuthResponse(null, null, null, "No reset code found");
        } 

        if (user.getResetExpiry().isBefore(LocalDateTime.now())) { // check expiration
            return new AuthResponse(null, null, null, "Reset code expired"); 
        }

        if (!user.getResetCode().equals(code)) { // validate code match
            return new AuthResponse(null, null, null, "Invalid reset code"); 
        } 

        user.setPassword(passwordEncoder.encode(newPassword)); // update password hash
        user.setResetCode(null); // clear reset code
        user.setResetExpiry(null); // clear reset expiry
        userRepository.save(user); // persist changes

        return new AuthResponse(null, user.getEmail(), user.getFullName(), "Password reset successful"); 
    }

    public AuthResponse deleteAccount(String email) {
        Optional<User> userOptional = userRepository.findByEmail(email);
        if (userOptional.isEmpty()) {
            return new AuthResponse(null, null, null, "User not found");
        }

        User user = userOptional.get();
        userRepository.delete(user);
        return new AuthResponse(null, user.getEmail(), user.getFullName(), "Account deleted successfully");
    }

    private String generateOtp() { // generate a 6-digit code
        Random rnd = new Random(); 
        int number = 100000 + rnd.nextInt(900000); 
        return String.valueOf(number); 
    } 
} 

