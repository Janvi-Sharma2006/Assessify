package com.examportal.service;

import com.examportal.dto.ProfileRequest;
import com.examportal.entity.Profile;
import com.examportal.repository.ProfileRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.Map;

@Service
public class ProfileService {

    @Autowired
    private ProfileRepository profileRepository;

    public Map<String, Object> getProfile(Long userId) {
        Profile profile = profileRepository.findByUserId(userId).orElse(null);
        Map<String, Object> map = new HashMap<>();
        if (profile == null) {
            map.put("exists", false);
            return map;
        }
        map.put("exists", true);
        map.put("phone", profile.getPhone());
        map.put("rollNumber", profile.getRollNumber());
        map.put("institution", profile.getInstitution());
        map.put("stream", profile.getStream());
        map.put("year", profile.getYear());
        map.put("section", profile.getSection());
        map.put("dateOfBirth", profile.getDateOfBirth());
        map.put("department", profile.getDepartment());
        map.put("designation", profile.getDesignation());
        return map;
    }

    public String saveProfile(ProfileRequest request) {
        Profile profile = profileRepository.findByUserId(request.getUserId()).orElse(new Profile());
        profile.setUserId(request.getUserId());
        profile.setPhone(request.getPhone());
        profile.setRollNumber(request.getRollNumber());
        profile.setInstitution(request.getInstitution());
        profile.setStream(request.getStream());
        profile.setYear(request.getYear());
        profile.setSection(request.getSection());
        profile.setDateOfBirth(request.getDateOfBirth());
        profile.setDepartment(request.getDepartment());
        profile.setDesignation(request.getDesignation());
        profileRepository.save(profile);
        return "Profile saved successfully";
    }
}