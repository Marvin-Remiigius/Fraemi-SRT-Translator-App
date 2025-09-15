# TODO: Fix Project Dashboard Issues

## Backend Changes
- [x] Update get_projects route to return 'name' and 'created' keys
- [x] Update create_project route to return 'name' and 'created' keys
- [x] Add DELETE /projects/<project_id> route to delete project and associated SRT files

## Frontend Changes
- [x] Update handleDeleteProject in Dashboardpage.jsx to send DELETE request to backend

## Testing
- [x] Test project creation and verify name displays
- [x] Test project deletion and verify it removes from server
