package com.examportal.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

@Entity
@Table(name = "profiles")
@Getter
@Setter
public class Profile {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

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