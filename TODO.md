# SRT Translator App Integration Tasks

## Backend Updates
- [x] Fix create_project in project_routes.py to return full project object (id, project_name, created_at)
- [x] Add GET /api/projects/<id>/files to fetch SRT files for a project
- [x] Update POST /translate in translate_routes.py to save translated_content to SrtFile (add file_id to request)
- [x] Add PUT /api/srt-files/<id>/save to update translated_content
- [x] Add GET /api/srt-files/<id>/download to return translated SRT as file

## Frontend Updates
- [ ] Update ProjectWorkspace.jsx to use real upload API (/upload) and translate API (with file_id)
- [ ] Update AdvancedEditor.jsx to implement real save (PUT /save) and download (GET /download)
- [ ] Update Dashboardpage.jsx to handle full project object from create_project response

## Testing
- [ ] Test backend APIs
- [ ] Run frontend and verify integrations
- [ ] Handle errors and edge cases
