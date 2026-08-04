# ADR-0006: Framework-First Platform Development

Version: 1.0  
Status: Approved  
Date: 4 August 2026

## Context

The Quaerens Platform now contains mature product systems whose value depends on consistent workflows, shared components and professional outputs. Rebuilding category-specific variants would fragment the platform, duplicate maintenance and lower product quality.

Airbnb Complaint Pack Builder Version 4 established the reference product experience for professional browser-first Complaint Packs. CRM2 established the workspace principle inside the Shared CRM Framework.

## Decision

All Quaerens Platform development must begin by classifying work under the correct existing framework.

The two primary framework decisions are:

1. Shared CRM Framework for CRM workspace, user, data and permission work.
2. Quaerens Complaint Pack Framework™ for Complaint Pack category, evidence, chronology, financial and document work.

New Complaint Pack categories are configured implementations of the Quaerens Complaint Pack Framework™ v1.0. They may change category questions, evidence, eligibility, complaint logic, wording, guidance and terminology, but may not create separate shared engines or visual systems.

Airbnb Complaint Pack Builder Version 4 is the v1.0 reference implementation and regression authority.

Framework changes require an explicit proposal describing the improvement, framework rationale and effect on every existing implementation. Shared behaviour may change only after approval, versioning and regression planning.

## Reasoning

A framework-first model:

- preserves a consistent user experience;
- prevents duplicated engines and components;
- concentrates improvements in one shared product boundary;
- protects document quality;
- makes accessibility, privacy and responsive behaviour testable;
- reduces regression risk;
- allows new categories to focus on subject-matter configuration.

## Long-term impact

The platform grows by extending approved frameworks rather than accumulating standalone products.

Every future Complaint Pack Builder must conform to the authoritative framework specification and governance directive. Every new builder and approved shared change must pass Airbnb regression and must not break other configured builders.

Architecture must never be duplicated merely because subject matter changes.
