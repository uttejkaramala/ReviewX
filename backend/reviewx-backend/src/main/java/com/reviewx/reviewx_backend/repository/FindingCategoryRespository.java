package com.reviewx.reviewx_backend.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.reviewx.reviewx_backend.entity.FindingCategory;

public interface FindingCategoryRespository extends JpaRepository<FindingCategory, Long>{

	Optional<FindingCategory> findByName(String name) ;
 }
