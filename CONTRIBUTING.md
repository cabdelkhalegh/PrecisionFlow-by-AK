# Contributing to PrecisionFlow

Thank you for your interest in contributing to PrecisionFlow! This document provides guidelines for contributing to the project.

---

## 🎯 Project Principles

Before contributing, please understand our core principles:

1. **Campaign is the OS container** - All features must reinforce this principle
2. **Audit trail is mandatory** - Every action must be traceable
3. **State machines are deterministic** - No ambiguous states
4. **Approvals cannot be bypassed** - Unless explicitly overridden with reason
5. **Risk visibility is required** - Missing information must be flagged
6. **Financial traceability** - All costs linked to CampaignID
7. **Learning loop enforced** - Every campaign produces intelligence

---

## 📚 Getting Started

### 1. Read the Documentation

Before contributing, please review:
- [README.md](./README.md) - Project overview
- [PRD.md](./PRD.md) - Complete product requirements
- [NEXT_STEPS.md](./NEXT_STEPS.md) - Implementation roadmap
- [ARCHITECTURE.md](./ARCHITECTURE.md) - Technical architecture

### 2. Set Up Development Environment

Please follow [DEV_SETUP.md](./DEV_SETUP.md) for step-by-step development environment setup instructions.

### 3. Join the Communication Channels

*(Communication channels will be set up during Foundation Phase)*

---

## 🔄 Development Workflow

### Branching Strategy

We use a feature-branch workflow:

- `main` - Production-ready code
- `develop` - Integration branch for features
- `feature/*` - Feature development branches
- `bugfix/*` - Bug fix branches
- `hotfix/*` - Emergency production fixes
- `release/*` - Release preparation branches

### Branch Naming Convention

```
feature/brief-ai-processing
feature/campaign-state-machine
bugfix/approval-workflow-error
hotfix/security-vulnerability
release/v1.0.0
```

---

## 📝 Commit Message Guidelines

### Format

```
<type>(<scope>): <subject>

<body>

<footer>
```

### Types

- **feat:** New feature
- **fix:** Bug fix
- **docs:** Documentation changes
- **style:** Code style changes (formatting, missing semi-colons, etc.)
- **refactor:** Code refactoring
- **test:** Adding or updating tests
- **chore:** Maintenance tasks
- **perf:** Performance improvements
- **security:** Security fixes

### Examples

```
feat(campaign): add campaign state machine

Implement deterministic state machine for campaign lifecycle.
States: draft → pending_approval → approved → executing → 
        closing → closed_and_locked

Relates to PRD Section 6

---

fix(approval): prevent approval bypass without override

Add validation to ensure approvals cannot be bypassed unless
explicitly overridden by Director with documented reason.

Fixes #123
```

---

## 🧪 Testing Requirements

All contributions must include appropriate tests:

### Required Tests

1. **Unit Tests**
   - All business logic must have unit tests
   - Target: 80%+ code coverage
   - Use descriptive test names

2. **Integration Tests**
   - Test workflows end-to-end
   - Test approval flows
   - Test state transitions

3. **API Tests**
   - Test all API endpoints
   - Test authentication/authorization
   - Test error handling

### Running Tests

*(Instructions will be added once test framework is set up)*

```bash
# Run all tests
npm test

# Run unit tests
npm run test:unit

# Run integration tests
npm run test:integration

# Check coverage
npm run test:coverage
```

---

## 📋 Pull Request Process

### Before Submitting

1. **Code Quality**
   - [ ] Code follows project style guide
   - [ ] All tests pass
   - [ ] No linting errors
   - [ ] Code is self-documenting or well-commented

2. **Testing**
   - [ ] New features have unit tests
   - [ ] Integration tests updated if needed
   - [ ] Manual testing completed

3. **Documentation**
   - [ ] README updated if needed
   - [ ] API documentation updated
   - [ ] Code comments added for complex logic

4. **Audit Trail**
   - [ ] All state changes are logged
   - [ ] User and timestamp captured for all actions
   - [ ] Audit trail tested

### PR Template

```markdown
## Description
Brief description of what this PR does

## Related Issue
Closes #[issue number]

## Type of Change
- [ ] New feature
- [ ] Bug fix
- [ ] Documentation update
- [ ] Refactoring
- [ ] Performance improvement
- [ ] Security fix

## Testing
Describe testing performed:
- [ ] Unit tests added/updated
- [ ] Integration tests added/updated
- [ ] Manual testing completed

## Checklist
- [ ] Code follows project style guide
- [ ] Tests pass locally
- [ ] Documentation updated
- [ ] Audit trail implemented
- [ ] No security vulnerabilities introduced
- [ ] PR follows PRD requirements

## Screenshots (if applicable)
Add screenshots for UI changes
```

### Review Process

1. **Automated Checks**
   - Linting
   - Tests
   - Code coverage
   - Security scanning

2. **Code Review**
   - At least one approving review required
   - Technical lead must approve architectural changes
   - Product owner must approve PRD-related changes

3. **Merge**
   - Squash and merge preferred for feature branches
   - No direct commits to `main`

---

## 🎨 Code Style Guidelines

### General Principles

- Write self-documenting code
- Use meaningful variable and function names
- Keep functions small and focused
- Follow DRY (Don't Repeat Yourself)
- Prefer composition over inheritance

### Naming Conventions

- **Variables:** camelCase (JavaScript/TypeScript) or snake_case (Python)
- **Functions:** camelCase (JavaScript/TypeScript) or snake_case (Python)
- **Classes:** PascalCase
- **Constants:** UPPER_SNAKE_CASE
- **Files:** kebab-case for file names
- **Database tables:** snake_case

### Comments

- Use comments to explain **why**, not **what**
- Complex algorithms should have explanatory comments
- All public APIs must have documentation comments
- TODOs should include issue number: `// TODO(#123): description`

---

## 🔒 Security Guidelines

### Critical Requirements

1. **Never commit secrets**
   - No API keys, passwords, or tokens in code
   - Use environment variables
   - Use secrets management tools

2. **Data Protection**
   - Encrypt sensitive data at rest
   - Use HTTPS for all communications
   - Sanitize all user inputs

3. **Authentication/Authorization**
   - Validate all permissions before operations
   - Use secure session management
   - Implement rate limiting

4. **Audit Trail**
   - Log all security-relevant events
   - Never delete audit logs
   - Protect audit logs from tampering

### Reporting Security Issues

If you discover a security vulnerability:
1. **DO NOT** open a public issue
2. Email security@[domain].com (to be set up)
3. Include detailed description and reproduction steps
4. Allow time for fix before public disclosure

---

## 📖 Documentation Standards

### Code Documentation

- All public functions must have documentation
- Include parameter types and return types
- Document exceptions that can be thrown
- Provide usage examples for complex functions

### API Documentation

- Use OpenAPI/Swagger for REST APIs
- Include request/response examples
- Document all error codes
- Keep documentation in sync with code

### User Documentation

- Write for the target user role
- Include screenshots for UI features
- Provide step-by-step guides
- Keep language clear and concise

---

## 🐛 Bug Reports

When reporting bugs, please include:

1. **Environment**
   - OS and version
   - Browser and version (for frontend bugs)
   - Relevant software versions

2. **Steps to Reproduce**
   - Detailed steps to reproduce the issue
   - Expected behavior
   - Actual behavior

3. **Evidence**
   - Screenshots or videos
   - Error messages
   - Log files (sanitized of sensitive data)

4. **Impact**
   - Severity (Critical/High/Medium/Low)
   - Number of users affected
   - Workaround (if any)

---

## 💡 Feature Requests

Before submitting a feature request:

1. Check if it aligns with PRD.md
2. Search existing issues to avoid duplicates
3. Provide clear use case and rationale
4. Consider implementation complexity

### Feature Request Template

```markdown
## User Story
As a [role], I want [feature] so that [benefit]

## Problem
Description of the problem this solves

## Proposed Solution
How should this work?

## Alternatives Considered
Other solutions you've considered

## PRD Alignment
How does this align with PRD.md?

## Additional Context
Any other information
```

---

## ❓ Questions?

If you have questions about contributing:

1. Check existing documentation
2. Search closed issues
3. Ask in communication channels
4. Open a discussion issue (not a bug report)

---

## 📜 Code of Conduct

### Our Pledge

We are committed to providing a welcoming and inclusive environment for all contributors.

### Expected Behavior

- Be respectful and professional
- Welcome diverse perspectives
- Focus on constructive feedback
- Help others learn and grow

### Unacceptable Behavior

- Harassment or discrimination
- Trolling or insulting comments
- Publishing private information
- Other unprofessional conduct

### Enforcement

Violations may result in:
1. Warning
2. Temporary ban
3. Permanent ban

Report violations to [conduct@domain.com] (to be set up)

---

## 🙏 Recognition

Contributors will be recognized in:
- CONTRIBUTORS.md file
- Release notes
- Project documentation

Significant contributions may lead to maintainer status.

---

## 📅 Roadmap Alignment

Please align contributions with our roadmap in [NEXT_STEPS.md](./NEXT_STEPS.md):

- **Current Phase:** Foundation (Architecture and Design)
- **Next Phase:** Phase 1 MVP (Campaign Management, AI Brief Processing)

---

Thank you for contributing to PrecisionFlow! 🚀

*Last updated: February 6, 2026*
