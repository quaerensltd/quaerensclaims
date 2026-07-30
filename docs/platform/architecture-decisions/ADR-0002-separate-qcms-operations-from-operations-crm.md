# ADR-0002: Separate QCMS Operations™ from Operations CRM™

Version: 1.0  
Status: Approved

## Context

The existing Operations CRM™ remains important to Quaerens. It supports internal business operations, lead management and sales workflows.

However, instructed complaint cases require a different type of operational environment.

Complaint management is not the same as lead management.

Sales teams need pipelines, appointments, listers, closers, campaign views and conversion tracking. Complaint Managers need evidence requests, case timelines, documents, internal notes, tasks, readiness checks, submission status and response monitoring.

## Decision

QCMS Operations™ will remain separate from Operations CRM™.

Operations CRM™ remains responsible for:

- Lead management
- Sales
- Managers
- Closers
- Processing
- Appointments
- Campaigns
- Sales pipeline workflows

QCMS Operations™ becomes the dedicated operational platform for instructed QCMS™ complaint cases.

## Reasoning

Combining sales workflows and complaint-management workflows would create confusion.

The two systems have different users, different purposes and different success measures.

Operations CRM™ is designed to support internal business operations and client acquisition. QCMS Operations™ is designed to support case progression, evidence handling, complaint preparation and operational accountability.

Keeping them separate protects both systems.

It allows Operations CRM™ to remain focused on business workflows while allowing QCMS Operations™ to become a professional complaint management workspace.

## Long-Term Impact

This decision creates a clean architectural boundary between:

- Sales activity
- Complaint management
- Client communication
- Partner collaboration

It also prevents future feature creep.

QCMS Operations™ must not become a sales CRM. Operations CRM™ must not become the complaint-management platform.

Each system has a clear role.
