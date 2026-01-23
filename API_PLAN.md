# API Development Plan

## 1. Authentication & Users
- [x] `POST /auth/login`
- [x] `POST /auth/register`
- [x] `GET /users/me`
- [x] `GET /users/me/profile`
- [x] `PUT /users/me/profile`

## 2. Content (Recipes & Restaurants)
- [x] `GET /recipes` (with search, filter, sort)
- [x] `GET /recipes/{id}`
- [x] `POST /recipes`
- [x] `GET /restaurants`
- [x] `GET /restaurants/{id}`
- [x] `POST /restaurants`

## 3. Comments
- [x] `GET /comments` (Nested structure supported)
- [x] `POST /comments` (Reply supported)

## 4. Collections
- [x] `POST /collections` (Toggle collection status)
- [ ] **TODO**: `GET /collections` - List user's collected recipes and restaurants.

## 5. Inventory (Fridge)
- [x] `GET /inventory/fridge`
- [x] `POST /inventory/fridge`
- [x] `PUT /inventory/fridge/{id}`
- [x] `DELETE /inventory/fridge/{id}`

## 6. Shopping List
- [x] `GET /inventory/shopping-list`
- [x] `POST /inventory/shopping-list`
- [x] `PUT /inventory/shopping-list/{id}`
- [x] `DELETE /inventory/shopping-list/{id}`
- [ ] **TODO**: `POST /inventory/shopping-list/batch` - Batch add items (e.g. from recipe ingredients).

## 7. Messages & Notifications
- [ ] **TODO**: Create `Notification` Model.
- [ ] **TODO**: `GET /notifications` - Get list of system notifications.
- [ ] **TODO**: `GET /interactions` - Get list of user interactions (likes, comments, follows).
- [ ] **TODO**: `PUT /notifications/{id}/read` - Mark notification as read.

## 8. Upload
- [x] `POST /upload` - Single file upload.

## 9. Documentation
- [ ] **TODO**: Verify Swagger UI is accessible at `/docs` and properly documented with Pydantic schemas.
