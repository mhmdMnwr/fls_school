# Notes

- NestJS upgraded from v11 to v12 for @nestjs/swagger@12 compatibility.
- Using --legacy-peer-deps for some transitive peer dependency conflicts.
- Installed mongodb-memory-server as devDependency for reproducible E2E tests without requiring active Atlas cluster during CI/testing.
- Configured Jest with NODE_OPTIONS="--experimental-vm-modules" for NestJS 12 ESM package compatibility.
- Parent identity: authenticated parent JWT with @ParentRoute() where req.user.studentId identifies the student.
