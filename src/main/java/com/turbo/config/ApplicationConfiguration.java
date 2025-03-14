package com.turbo.config;

import com.turbo.service.UserDetailService;

import java.util.concurrent.TimeUnit;

import javax.sql.DataSource;

import org.springframework.boot.CommandLineRunner;
import org.springframework.cache.CacheManager;
import org.springframework.cache.concurrent.ConcurrentMapCacheManager;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Profile;
import org.springframework.core.io.ClassPathResource;
import org.springframework.http.CacheControl;
import org.springframework.jdbc.datasource.init.ResourceDatabasePopulator;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;
import org.springframework.web.servlet.resource.VersionResourceResolver;

@Configuration
public class ApplicationConfiguration implements WebMvcConfigurer {

        @Bean
        BCryptPasswordEncoder passwordEncoder() {
                return new BCryptPasswordEncoder();
        }

        @Bean
        public AuthenticationManager authenticationManager(AuthenticationConfiguration config) throws Exception {
                return config.getAuthenticationManager();
        }

        @Bean
        public DaoAuthenticationProvider authenticationProvider(UserDetailService userDetailService,
                        PasswordEncoder passwordEncoder) {
                DaoAuthenticationProvider authProvider = new DaoAuthenticationProvider();

                authProvider.setUserDetailsService(userDetailService);
                authProvider.setPasswordEncoder(passwordEncoder());

                return authProvider;
        }

        @Bean
        public RestTemplate restTemplate() {
                return new RestTemplate();
        }

        @Bean
        public CacheManager cacheManager() {
                ConcurrentMapCacheManager cacheManager = new ConcurrentMapCacheManager();
                cacheManager.setCacheNames(java.util.Arrays.asList("vehicles"));
                return cacheManager;
        }

        @Bean
        @Profile("dev")
        public CommandLineRunner initDatabase(DataSource dataSource) {
                return args -> {
                        ResourceDatabasePopulator cleaner = new ResourceDatabasePopulator();
                        cleaner.addScript(new ClassPathResource("cleanup.sql"));
                        cleaner.execute(dataSource);

                        ResourceDatabasePopulator populator = new ResourceDatabasePopulator();
                        populator.addScript(new ClassPathResource("data.sql"));
                        populator.execute(dataSource);
                };
        }

        @Override
        public void addResourceHandlers(ResourceHandlerRegistry registry) {
                registry.addResourceHandler("/css/**")
                                .addResourceLocations("classpath:/static/css/")
                                .setCacheControl(CacheControl.maxAge(365, TimeUnit.DAYS))
                                .resourceChain(false)
                                .addResolver(new VersionResourceResolver()
                                                .addContentVersionStrategy("/**"));

                registry.addResourceHandler("/webjars/**")
                                .addResourceLocations("classpath:/META-INF/resources/webjars/");

                registry.addResourceHandler("/js/**")
                                .addResourceLocations("classpath:/static/js/")
                                .setCacheControl(CacheControl.maxAge(365, TimeUnit.DAYS))
                                .resourceChain(false)
                                .addResolver(new VersionResourceResolver()
                                                .addContentVersionStrategy("/**"));

                registry.addResourceHandler("/static/uploads/**")
                                .addResourceLocations("file:" + System.getProperty("user.home") + "/uploads/")
                                .setCacheControl(CacheControl.maxAge(365, TimeUnit.DAYS));

                registry.addResourceHandler("/static/**")
                                .addResourceLocations("classpath:/static/")
                                .setCacheControl(CacheControl.maxAge(365, TimeUnit.DAYS));

                registry.addResourceHandler("/images/**", "/static/images/**")
                                .addResourceLocations(
                                                "file:" + System.getProperty("user.home") + "/uploads/vehicles/",
                                                "classpath:/static/images/")
                                .setCacheControl(CacheControl.maxAge(365, TimeUnit.DAYS));

                registry.addResourceHandler("/uploads/**")
                                .addResourceLocations("file:" + System.getProperty("user.home") + "/uploads/")
                                .setCacheControl(CacheControl.maxAge(365, TimeUnit.DAYS));

                registry.addResourceHandler("/static/**")
                                .addResourceLocations("classpath:/static/")
                                .setCacheControl(CacheControl.maxAge(365, TimeUnit.DAYS));
        }
}