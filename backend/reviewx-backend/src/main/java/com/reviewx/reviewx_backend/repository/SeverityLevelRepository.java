package com.reviewx.reviewx_backend.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.reviewx.reviewx_backend.entity.SeverityLevel;

public interface SeverityLevelRepository extends JpaRepository<SeverityLevel, Long> {

	Optional<SeverityLevel> findByName(String name);
	
	List<SeverityLevel> findAllByOrderByPriorityOrderAsc();
}
