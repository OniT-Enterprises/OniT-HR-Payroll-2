# Contributing to OniT HR Payroll

Thank you for considering contributing to the OniT HR Payroll system! This document provides guidelines and information for contributors.

## 🤝 How to Contribute

### Reporting Issues

Before creating an issue, please:

1. **Search existing issues** to avoid duplicates
2. **Use the issue template** if available
3. **Provide clear description** with steps to reproduce
4. **Include environment details** (browser, OS, etc.)

### Suggesting Features

For feature requests:

1. **Check the roadmap** to see if it's planned
2. **Open a discussion** before implementing
3. **Explain the use case** and benefit
4. **Consider backward compatibility**

### Code Contributions

1. **Fork the repository**
2. **Create a feature branch**
3. **Make your changes**
4. **Test thoroughly**
5. **Submit a pull request**

## 🛠️ Development Setup

### Prerequisites

- Node.js 18.x or higher
- npm or yarn
- Git
- Firebase CLI (optional)

### Local Setup

```bash
# Clone your fork
git clone https://github.com/YOUR_USERNAME/OniT-HR-Payroll.git
cd OniT-HR-Payroll

# Add upstream remote
git remote add upstream https://github.com/OniT-Enterprises/OniT-HR-Payroll.git

# Install dependencies
npm install

# Copy environment file
cp .env.example .env.local

# Start development server
npm run dev
```

## 📋 Coding Standards

### TypeScript

- Use TypeScript for all new code
- Define proper interfaces and types
- Avoid `any` type unless absolutely necessary
- Use strict type checking

### React Components

```typescript
// Preferred component structure
interface ComponentProps {
  title: string;
  optional?: boolean;
}

export default function Component({ title, optional = false }: ComponentProps) {
  // Component logic
  return <div>{title}</div>;
}
```

### Code Style

- Use Prettier for formatting
- Follow ESLint rules
- Use meaningful variable names
- Add JSDoc comments for complex functions
- Keep functions small and focused

### File Organization

```
components/
├── ui/              # Base UI components
├── layout/          # Layout components
├── feature/         # Feature-specific components
└── forms/           # Form components

pages/
├── staff/           # Employee management
├── hiring/          # Recruitment
├── dashboards/      # Analytics
└── reports/         # Reporting

services/
├── employeeService.ts
├── departmentService.ts
└── authService.ts
```

## 🧪 Testing

### Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm test -- --watch

# Run specific test file
npm test Component.test.tsx
```

### Writing Tests

- Write tests for new features
- Update tests when modifying existing code
- Use descriptive test names
- Test both success and error cases

```typescript
// Example test structure
describe("EmployeeService", () => {
  it("should create employee successfully", async () => {
    // Arrange
    const employee = mockEmployee;

    // Act
    const result = await employeeService.addEmployee(employee);

    // Assert
    expect(result).toBeDefined();
  });
});
```

## 📝 Commit Guidelines

### Commit Message Format

```
type(scope): subject

body

footer
```

### Types

- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, etc.)
- `refactor`: Code refactoring
- `test`: Adding or updating tests
- `chore`: Maintenance tasks

### Examples

```bash
feat(employees): add bulk CSV import functionality

- Implement column mapping interface
- Add validation for required fields
- Support for large file uploads

Closes #123
```

## 🔄 Pull Request Process

### Before Submitting

1. **Update documentation** if needed
2. **Add tests** for new functionality
3. **Run the full test suite**
4. **Check code formatting**
5. **Update CHANGELOG.md** if applicable

### PR Template

```markdown
## Description

Brief description of changes

## Type of Change

- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Testing

- [ ] Unit tests pass
- [ ] Manual testing completed
- [ ] No console errors

## Screenshots

(If applicable)

## Checklist

- [ ] Code follows style guidelines
- [ ] Self-review completed
- [ ] Documentation updated
- [ ] Tests added/updated
```

### Review Process

1. **Automated checks** must pass
2. **Code review** by maintainer
3. **Approval** required before merge
4. **Squash and merge** preferred

## 🚀 Release Process

### Versioning

We use [Semantic Versioning](https://semver.org/):

- `MAJOR.MINOR.PATCH`
- Breaking changes increment MAJOR
- New features increment MINOR
- Bug fixes increment PATCH

### Release Checklist

- [ ] Update version in package.json
- [ ] Update CHANGELOG.md
- [ ] Create release notes
- [ ] Tag the release
- [ ] Deploy to production

## 🏷️ Issue Labels

### Type Labels

- `bug` - Something isn't working
- `enhancement` - New feature request
- `documentation` - Documentation improvements
- `question` - Further information needed

### Priority Labels

- `priority: high` - Critical issues
- `priority: medium` - Important features
- `priority: low` - Nice to have

### Status Labels

- `status: needs-triage` - Needs review
- `status: in-progress` - Being worked on
- `status: blocked` - Cannot proceed
- `status: ready-for-review` - Ready for review

## 📚 Resources

### Documentation

- [React Documentation](https://react.dev/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Firebase Documentation](https://firebase.google.com/docs)
- [Tailwind CSS](https://tailwindcss.com/docs)

### Tools

- [Vite](https://vitejs.dev/) - Build tool
- [Vitest](https://vitest.dev/) - Testing framework
- [ESLint](https://eslint.org/) - Linting
- [Prettier](https://prettier.io/) - Code formatting

## 💬 Communication

### Getting Help

- **GitHub Issues** - Bug reports and feature requests
- **GitHub Discussions** - General questions and ideas
- **Code Reviews** - Technical discussions

### Community Guidelines

- Be respectful and inclusive
- Provide constructive feedback
- Help others learn and grow
- Follow the code of conduct

## 🎯 Project Goals

### Short Term

- Improve test coverage
- Enhance performance
- Add more features
- Better documentation

### Long Term

- Mobile application
- API integrations
- Advanced analytics
- Scalability improvements

## 📄 Code of Conduct

By participating in this project, you agree to:

- Use welcoming and inclusive language
- Be respectful of differing viewpoints
- Accept constructive criticism gracefully
- Focus on what's best for the community
- Show empathy towards other community members

## 🙏 Recognition

Contributors will be recognized in:

- README.md contributors section
- Release notes
- Project documentation
- Annual contributor highlights

Thank you for contributing to OniT HR Payroll! 🚀
