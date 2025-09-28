# API Specification - Vacancies Application

## 📋 Overview

This document provides comprehensive API specification for the Vacancies application, including REST endpoints, request/response formats, authentication, and error handling.

## 🔗 Base URL

```
http://localhost:8000/api/vacancies/
```

## 🔐 Authentication

All API endpoints require authentication. Use one of the following methods:

### Bearer Token
```http
Authorization: Bearer <your_jwt_token>
```

### Session Authentication
```http
Cookie: sessionid=<session_id>
```

## 📊 Endpoints

### 1. List Vacancies

**GET** `/api/vacancies/`

Retrieve a list of vacancies with optional filtering and pagination.

#### Query Parameters

| Parameter | Type | Description | Example |
|-----------|------|-------------|---------|
| `page` | integer | Page number for pagination | `?page=2` |
| `page_size` | integer | Number of items per page | `?page_size=20` |
| `search` | string | Search in name, external_id, invite_title, scorecard_title | `?search=developer` |
| `recruiter` | integer | Filter by recruiter ID | `?recruiter=1` |
| `is_active` | boolean | Filter by active status | `?is_active=true` |
| `available_grades` | integer | Filter by grade ID | `?available_grades=1` |
| `ordering` | string | Sort by field (name, created_at, updated_at) | `?ordering=-created_at` |

#### Response

```json
{
    "count": 25,
    "next": "http://localhost:8000/api/vacancies/?page=2",
    "previous": null,
    "results": [
        {
            "id": 1,
            "name": "Senior Python Developer",
            "external_id": "DEV001",
            "recruiter": 1,
            "recruiter_name": "John Doe",
            "recruiter_username": "john.doe",
            "invite_title": "Join Our Team",
            "invite_text": "We are looking for a talented Python developer...",
            "scorecard_title": "Python Developer Assessment",
            "scorecard_link": "https://example.com/scorecard",
            "questions_belarus": "What is your experience with Django?",
            "questions_poland": "Tell us about your Python projects",
            "vacancy_link_belarus": "https://rabota.by/vacancy/123",
            "vacancy_link_poland": "https://pracuj.pl/vacancy/123",
            "candidate_update_prompt": "Update candidate information...",
            "invite_prompt": "Generate invitation email...",
            "screening_duration": 45,
            "available_grades": [1, 2, 3],
            "available_grades_names": ["Junior", "Middle", "Senior"],
            "is_active": true,
            "created_at": "2024-01-15T10:30:00Z",
            "updated_at": "2024-01-20T14:45:00Z"
        }
    ]
}
```

### 2. Create Vacancy

**POST** `/api/vacancies/`

Create a new vacancy.

#### Request Body

```json
{
    "name": "Senior Python Developer",
    "external_id": "DEV002",
    "recruiter": 1,
    "invite_title": "Join Our Team",
    "invite_text": "We are looking for a talented Python developer...",
    "scorecard_title": "Python Developer Assessment",
    "scorecard_link": "https://example.com/scorecard",
    "questions_belarus": "What is your experience with Django?",
    "questions_poland": "Tell us about your Python projects",
    "vacancy_link_belarus": "https://rabota.by/vacancy/124",
    "vacancy_link_poland": "https://pracuj.pl/vacancy/124",
    "candidate_update_prompt": "Update candidate information...",
    "invite_prompt": "Generate invitation email...",
    "screening_duration": 45,
    "available_grades": [1, 2, 3],
    "interviewers": [1, 2],
    "is_active": true
}
```

#### Response

```json
{
    "id": 2,
    "name": "Senior Python Developer",
    "external_id": "DEV002",
    "recruiter": 1,
    "recruiter_name": "John Doe",
    "recruiter_username": "john.doe",
    "invite_title": "Join Our Team",
    "invite_text": "We are looking for a talented Python developer...",
    "scorecard_title": "Python Developer Assessment",
    "scorecard_link": "https://example.com/scorecard",
    "questions_belarus": "What is your experience with Django?",
    "questions_poland": "Tell us about your Python projects",
    "vacancy_link_belarus": "https://rabota.by/vacancy/124",
    "vacancy_link_poland": "https://pracuj.pl/vacancy/124",
    "candidate_update_prompt": "Update candidate information...",
    "invite_prompt": "Generate invitation email...",
    "screening_duration": 45,
    "available_grades": [1, 2, 3],
    "available_grades_names": ["Junior", "Middle", "Senior"],
    "is_active": true,
    "created_at": "2024-01-21T09:15:00Z",
    "updated_at": "2024-01-21T09:15:00Z"
}
```

### 3. Retrieve Vacancy

**GET** `/api/vacancies/{id}/`

Retrieve a specific vacancy by ID.

#### Response

```json
{
    "id": 1,
    "name": "Senior Python Developer",
    "external_id": "DEV001",
    "recruiter": 1,
    "recruiter_name": "John Doe",
    "recruiter_username": "john.doe",
    "invite_title": "Join Our Team",
    "invite_text": "We are looking for a talented Python developer...",
    "scorecard_title": "Python Developer Assessment",
    "scorecard_link": "https://example.com/scorecard",
    "questions_belarus": "What is your experience with Django?",
    "questions_poland": "Tell us about your Python projects",
    "vacancy_link_belarus": "https://rabota.by/vacancy/123",
    "vacancy_link_poland": "https://pracuj.pl/vacancy/123",
    "candidate_update_prompt": "Update candidate information...",
    "invite_prompt": "Generate invitation email...",
    "screening_duration": 45,
    "available_grades": [1, 2, 3],
    "available_grades_names": ["Junior", "Middle", "Senior"],
    "is_active": true,
    "created_at": "2024-01-15T10:30:00Z",
    "updated_at": "2024-01-20T14:45:00Z"
}
```

### 4. Update Vacancy

**PUT** `/api/vacancies/{id}/`

Update a specific vacancy.

#### Request Body

Same as create vacancy, but all fields are optional.

#### Response

Same as retrieve vacancy with updated data.

### 5. Partial Update Vacancy

**PATCH** `/api/vacancies/{id}/`

Partially update a specific vacancy.

#### Request Body

```json
{
    "is_active": false,
    "screening_duration": 60
}
```

#### Response

Same as retrieve vacancy with updated data.

### 6. Delete Vacancy

**DELETE** `/api/vacancies/{id}/`

Delete a specific vacancy.

#### Response

```http
HTTP/1.1 204 No Content
```

### 7. Toggle Active Status

**POST** `/api/vacancies/{id}/toggle-active/`

Toggle the active status of a vacancy.

#### Response

```json
{
    "id": 1,
    "name": "Senior Python Developer",
    "external_id": "DEV001",
    "recruiter": 1,
    "recruiter_name": "John Doe",
    "recruiter_username": "john.doe",
    "invite_title": "Join Our Team",
    "invite_text": "We are looking for a talented Python developer...",
    "scorecard_title": "Python Developer Assessment",
    "scorecard_link": "https://example.com/scorecard",
    "questions_belarus": "What is your experience with Django?",
    "questions_poland": "Tell us about your Python projects",
    "vacancy_link_belarus": "https://rabota.by/vacancy/123",
    "vacancy_link_poland": "https://pracuj.pl/vacancy/123",
    "candidate_update_prompt": "Update candidate information...",
    "invite_prompt": "Generate invitation email...",
    "screening_duration": 45,
    "available_grades": [1, 2, 3],
    "available_grades_names": ["Junior", "Middle", "Senior"],
    "is_active": false,
    "created_at": "2024-01-15T10:30:00Z",
    "updated_at": "2024-01-21T15:30:00Z"
}
```

### 8. Assign Grades

**POST** `/api/vacancies/{id}/assign-grades/`

Assign grades to a vacancy.

#### Request Body

```json
{
    "grade_ids": [1, 2, 3, 4]
}
```

#### Response

```json
{
    "id": 1,
    "name": "Senior Python Developer",
    "external_id": "DEV001",
    "recruiter": 1,
    "recruiter_name": "John Doe",
    "recruiter_username": "john.doe",
    "invite_title": "Join Our Team",
    "invite_text": "We are looking for a talented Python developer...",
    "scorecard_title": "Python Developer Assessment",
    "scorecard_link": "https://example.com/scorecard",
    "questions_belarus": "What is your experience with Django?",
    "questions_poland": "Tell us about your Python projects",
    "vacancy_link_belarus": "https://rabota.by/vacancy/123",
    "vacancy_link_poland": "https://pracuj.pl/vacancy/123",
    "candidate_update_prompt": "Update candidate information...",
    "invite_prompt": "Generate invitation email...",
    "screening_duration": 45,
    "available_grades": [1, 2, 3, 4],
    "available_grades_names": ["Junior", "Middle", "Senior", "Lead"],
    "is_active": true,
    "created_at": "2024-01-15T10:30:00Z",
    "updated_at": "2024-01-21T16:00:00Z"
}
```

### 9. My Vacancies

**GET** `/api/vacancies/my-vacancies/`

Get vacancies assigned to the current user.

#### Response

```json
[
    {
        "id": 1,
        "name": "Senior Python Developer",
        "external_id": "DEV001",
        "recruiter_name": "John Doe",
        "available_grades_count": 3,
        "is_active": true,
        "created_at": "2024-01-15T10:30:00Z"
    },
    {
        "id": 2,
        "name": "Frontend Developer",
        "external_id": "DEV002",
        "recruiter_name": "John Doe",
        "available_grades_count": 2,
        "is_active": true,
        "created_at": "2024-01-16T11:00:00Z"
    }
]
```

### 10. Vacancy Statistics

**GET** `/api/vacancies/stats/`

Get statistics about vacancies.

#### Response

```json
{
    "total_vacancies": 25,
    "active_vacancies": 20,
    "inactive_vacancies": 5,
    "vacancies_by_recruiter": {
        "john.doe": {
            "total": 15,
            "active": 12
        },
        "jane.smith": {
            "total": 10,
            "active": 8
        }
    },
    "vacancies_by_grade": {
        "Junior": 5,
        "Middle": 10,
        "Senior": 8,
        "Lead": 2
    },
    "recent_vacancies": [
        {
            "id": 1,
            "name": "Senior Python Developer",
            "external_id": "DEV001",
            "recruiter_name": "John Doe",
            "available_grades_count": 3,
            "is_active": true,
            "created_at": "2024-01-15T10:30:00Z"
        }
    ]
}
```

### 11. Search Vacancies

**GET** `/api/vacancies/search/`

Advanced search for vacancies with multiple filters.

#### Query Parameters

| Parameter | Type | Description | Example |
|-----------|------|-------------|---------|
| `q` | string | Search query | `?q=python developer` |
| `grade_id` | integer | Filter by grade ID | `?grade_id=2` |
| `recruiter_id` | integer | Filter by recruiter ID | `?recruiter_id=1` |
| `is_active` | boolean | Filter by active status | `?is_active=true` |
| `page` | integer | Page number | `?page=1` |
| `page_size` | integer | Items per page | `?page_size=10` |

#### Response

Same paginated format as list vacancies.

## 📋 Data Models

### Vacancy Model

```json
{
    "id": "integer (read-only)",
    "name": "string (required, max_length=200)",
    "external_id": "string (required, max_length=100, unique)",
    "recruiter": "integer (required, foreign key to User)",
    "recruiter_name": "string (read-only, computed from recruiter)",
    "recruiter_username": "string (read-only, computed from recruiter)",
    "invite_title": "string (required, max_length=200)",
    "invite_text": "string (required)",
    "scorecard_title": "string (required, max_length=200)",
    "scorecard_link": "string (optional, URL field)",
    "questions_belarus": "string (optional)",
    "questions_poland": "string (optional)",
    "vacancy_link_belarus": "string (optional, URL field)",
    "vacancy_link_poland": "string (optional, URL field)",
    "candidate_update_prompt": "string (optional)",
    "invite_prompt": "string (optional)",
    "screening_duration": "integer (default=45, min=1, max=480)",
    "available_grades": "array of integers (optional, many-to-many to Grade)",
    "available_grades_names": "array of strings (read-only, computed)",
    "interviewers": "array of integers (optional, many-to-many to Interviewer)",
    "is_active": "boolean (default=true)",
    "created_at": "datetime (read-only)",
    "updated_at": "datetime (read-only)"
}
```

## 🚨 Error Handling

### Error Response Format

```json
{
    "error": "Error message description",
    "details": "Additional error details (optional)",
    "code": "ERROR_CODE (optional)"
}
```

### HTTP Status Codes

| Code | Description |
|------|-------------|
| 200 | OK - Request successful |
| 201 | Created - Resource created successfully |
| 204 | No Content - Resource deleted successfully |
| 400 | Bad Request - Invalid request data |
| 401 | Unauthorized - Authentication required |
| 403 | Forbidden - Insufficient permissions |
| 404 | Not Found - Resource not found |
| 405 | Method Not Allowed - HTTP method not supported |
| 500 | Internal Server Error - Server error |

### Common Error Examples

#### 400 Bad Request - Validation Error

```json
{
    "error": "Validation failed",
    "details": {
        "name": ["This field is required."],
        "external_id": ["Vacancy with this external ID already exists."]
    }
}
```

#### 401 Unauthorized

```json
{
    "error": "Authentication credentials were not provided."
}
```

#### 403 Forbidden

```json
{
    "error": "You do not have permission to perform this action."
}
```

#### 404 Not Found

```json
{
    "error": "Not found."
}
```

#### 500 Internal Server Error

```json
{
    "error": "Internal server error occurred.",
    "details": "Please contact support if the problem persists."
}
```

## 🔒 Permissions

### Permission Levels

1. **Read Only**: Can view vacancies and statistics
2. **Recruiter**: Can create, update, and manage their own vacancies
3. **Admin**: Can manage all vacancies and access all statistics
4. **Superuser**: Full access to all operations

### Permission Matrix

| Action | Read Only | Recruiter | Admin | Superuser |
|--------|-----------|-----------|-------|-----------|
| List vacancies | ✅ | ✅ | ✅ | ✅ |
| View vacancy details | ✅ | ✅ | ✅ | ✅ |
| Create vacancy | ❌ | ✅ | ✅ | ✅ |
| Update own vacancy | ❌ | ✅ | ✅ | ✅ |
| Update any vacancy | ❌ | ❌ | ✅ | ✅ |
| Delete vacancy | ❌ | ✅ (own only) | ✅ | ✅ |
| Toggle active status | ❌ | ✅ (own only) | ✅ | ✅ |
| Assign grades | ❌ | ✅ (own only) | ✅ | ✅ |
| View statistics | ✅ | ✅ (own data) | ✅ | ✅ |
| Search vacancies | ✅ | ✅ | ✅ | ✅ |

## 📊 Rate Limiting

### Default Limits

- **Authenticated users**: 1000 requests per hour
- **Unauthenticated users**: 100 requests per hour

### Rate Limit Headers

```http
X-RateLimit-Limit: 1000
X-RateLimit-Remaining: 999
X-RateLimit-Reset: 1640995200
```

## 🔄 Pagination

### Default Pagination

- **Page size**: 20 items per page
- **Maximum page size**: 100 items per page

### Pagination Response Format

```json
{
    "count": 150,
    "next": "http://localhost:8000/api/vacancies/?page=3",
    "previous": "http://localhost:8000/api/vacancies/?page=1",
    "results": [...]
}
```

## 🔍 Filtering

### Available Filters

| Field | Type | Description |
|-------|------|-------------|
| `recruiter` | integer | Filter by recruiter ID |
| `is_active` | boolean | Filter by active status |
| `available_grades` | integer | Filter by grade ID |
| `created_at` | datetime | Filter by creation date |
| `updated_at` | datetime | Filter by update date |

### Filter Examples

```
GET /api/vacancies/?recruiter=1&is_active=true
GET /api/vacancies/?available_grades=2&created_at__gte=2024-01-01
GET /api/vacancies/?updated_at__range=2024-01-01,2024-01-31
```

## 🔍 Searching

### Search Fields

Search is performed across the following fields:
- `name` - vacancy name
- `external_id` - external identifier
- `invite_title` - invitation title
- `scorecard_title` - scorecard title

### Search Examples

```
GET /api/vacancies/?search=python
GET /api/vacancies/?search=developer
GET /api/vacancies/?search=DEV001
```

## 📈 Sorting

### Available Sort Fields

| Field | Description |
|-------|-------------|
| `name` | Sort by vacancy name |
| `created_at` | Sort by creation date |
| `updated_at` | Sort by update date |
| `external_id` | Sort by external ID |

### Sort Examples

```
GET /api/vacancies/?ordering=name
GET /api/vacancies/?ordering=-created_at
GET /api/vacancies/?ordering=external_id
```

## 🧪 Testing

### Test Environment

```bash
# Run tests
python manage.py test apps.vacancies

# Run specific test
python manage.py test apps.vacancies.tests.test_api.VacancyAPITest

# Run with coverage
coverage run --source='.' manage.py test apps.vacancies
coverage report
```

### Example Test Cases

```python
# Test creating a vacancy
def test_create_vacancy(self):
    data = {
        'name': 'Test Vacancy',
        'external_id': 'TEST001',
        'recruiter': self.recruiter.id,
        'invite_title': 'Test Invite'
    }
    response = self.client.post('/api/vacancies/', data)
    self.assertEqual(response.status_code, 201)
    self.assertEqual(response.data['name'], 'Test Vacancy')

# Test filtering
def test_filter_by_recruiter(self):
    response = self.client.get('/api/vacancies/?recruiter=1')
    self.assertEqual(response.status_code, 200)
    self.assertTrue(len(response.data['results']) > 0)

# Test search
def test_search_vacancies(self):
    response = self.client.get('/api/vacancies/?search=python')
    self.assertEqual(response.status_code, 200)
    self.assertTrue(len(response.data['results']) > 0)
```

## 📚 Examples

### Python Client Example

```python
import requests

class VacancyAPIClient:
    def __init__(self, base_url, token):
        self.base_url = base_url
        self.headers = {
            'Authorization': f'Bearer {token}',
            'Content-Type': 'application/json'
        }
    
    def get_vacancies(self, **params):
        response = requests.get(
            f'{self.base_url}/api/vacancies/',
            headers=self.headers,
            params=params
        )
        return response.json()
    
    def create_vacancy(self, data):
        response = requests.post(
            f'{self.base_url}/api/vacancies/',
            headers=self.headers,
            json=data
        )
        return response.json()
    
    def update_vacancy(self, vacancy_id, data):
        response = requests.put(
            f'{self.base_url}/api/vacancies/{vacancy_id}/',
            headers=self.headers,
            json=data
        )
        return response.json()
    
    def delete_vacancy(self, vacancy_id):
        response = requests.delete(
            f'{self.base_url}/api/vacancies/{vacancy_id}/',
            headers=self.headers
        )
        return response.status_code == 204

# Usage
client = VacancyAPIClient('http://localhost:8000', 'your_jwt_token')

# Get all vacancies
vacancies = client.get_vacancies()

# Search vacancies
search_results = client.get_vacancies(search='python')

# Create new vacancy
new_vacancy = client.create_vacancy({
    'name': 'Python Developer',
    'external_id': 'PYTHON001',
    'recruiter': 1,
    'invite_title': 'Join Our Python Team'
})
```

### JavaScript Client Example

```javascript
class VacancyAPIClient {
    constructor(baseUrl, token) {
        this.baseUrl = baseUrl;
        this.token = token;
    }
    
    async request(endpoint, options = {}) {
        const url = `${this.baseUrl}/api/vacancies${endpoint}`;
        const config = {
            headers: {
                'Authorization': `Bearer ${this.token}`,
                'Content-Type': 'application/json',
                ...options.headers
            },
            ...options
        };
        
        const response = await fetch(url, config);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        return response.json();
    }
    
    async getVacancies(params = {}) {
        const queryString = new URLSearchParams(params).toString();
        return this.request(`/?${queryString}`);
    }
    
    async getVacancy(id) {
        return this.request(`/${id}/`);
    }
    
    async createVacancy(data) {
        return this.request('/', {
            method: 'POST',
            body: JSON.stringify(data)
        });
    }
    
    async updateVacancy(id, data) {
        return this.request(`/${id}/`, {
            method: 'PUT',
            body: JSON.stringify(data)
        });
    }
    
    async deleteVacancy(id) {
        return this.request(`/${id}/`, {
            method: 'DELETE'
        });
    }
    
    async toggleActive(id) {
        return this.request(`/${id}/toggle-active/`, {
            method: 'POST'
        });
    }
    
    async assignGrades(id, gradeIds) {
        return this.request(`/${id}/assign-grades/`, {
            method: 'POST',
            body: JSON.stringify({ grade_ids: gradeIds })
        });
    }
    
    async getMyVacancies() {
        return this.request('/my-vacancies/');
    }
    
    async getStats() {
        return this.request('/stats/');
    }
    
    async searchVacancies(query, filters = {}) {
        return this.request('/search/', {
            method: 'GET',
            params: { q: query, ...filters }
        });
    }
}

// Usage
const client = new VacancyAPIClient('http://localhost:8000', 'your_jwt_token');

// Get all vacancies
const vacancies = await client.getVacancies();

// Search vacancies
const searchResults = await client.searchVacancies('python developer');

// Create new vacancy
const newVacancy = await client.createVacancy({
    name: 'JavaScript Developer',
    external_id: 'JS001',
    recruiter: 1,
    invite_title: 'Join Our Frontend Team'
});

// Toggle active status
const updatedVacancy = await client.toggleActive(newVacancy.id);
```

## 📝 Changelog

### Version 1.0.0 (2024-01-21)
- Initial API release
- Basic CRUD operations for vacancies
- Authentication and authorization
- Search and filtering capabilities
- Pagination support
- Error handling
- Documentation

### Future Versions
- Bulk operations
- Advanced analytics endpoints
- Webhook support
- Real-time updates
- Enhanced filtering options
