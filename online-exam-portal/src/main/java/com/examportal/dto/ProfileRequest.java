package com.examportal.dto;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class ProfileRequest {

    private Long userId;
    private String phone;
    private String rollNumber;
    private String institution;
    private String stream;
    private String year;
    private String section;
    private String dateOfBirth;
    private String department;
    private String designation;
}