# Miêu tả

Phát triển một dự án web cho phép người dùng paste structure JSON bất kỳ vào app.

Sau đó sẽ tạo ra top random danh sách items tương ứng với structure đó, sử dụng AI để tạo dữ liệu.

Giống như mock dữ liệu cho phía FE test via API thật mà không cần hardcode. Dễ tích hợp API thật cho sau này khi phía BE hoàn thiện.

Gần giống với một API spec nhưng có data thật có thể dùng cho tất cả các dự án với nhiều cấu trúc, api url khác nhau

Cụ thể chi tiết:

## Tạo tên project

Người dùng vào web UI điền tên dự án tự. Hệ thống sẽ tạo ra một dự án tương cùng với `api prefix` là tên dự án đó. Ví dụ: `Vin Manage AI` -> `vin-manage-ai/api`

## Giao diện, Pages

- List Project
- CRUD Project
- List API of Project (Hiển thị danh sách APIs của Project + Tên Project + Miêu tả Project)
- CRUD API of Project

## Custom response, paging - IMPORTANT

Người dùng có thể custom lại các status code, response hoặc phân trang cụ thể trên UI thông qua button hỗ trợ tạo mới 1 api.

Ví dụ:

Tạo api User

Người dùng sẽ điền `Description`, `Name`, `Endpoint` với các rules sau:

- Description: Không bắt buộc
- Name: Bắt buộc
- Base Endpoint: Bắt buộc. Nếu người không tích chọn `Custom` sẽ tự động chuyển sang normalize và đúng chuẩn RESTful theo `Name`. Ex: `Name` là `User Management` chuyển thành `user-management` lúc này `base api` sẽ có format như sau: `vin-manage-ai/api/user-management` ([api prefix của project]/[base api])

Khi người dùng bấm lưu sẽ tạo record trong database với default các APIs sẽ tạo bao gồm: `list, detail, create, delete, update` chuẩn RESTFUL. Sau đó redirect tới trang detail

Tại trang detail sẽ cho người dùng custom lại `status code, json response structure, endpoint, http method` và thêm 1 `api` hay `endpoint` khác cụ thể như sau:

### API GET vin-manage-ai/api/user-management (default)

Mặc định API này là get list theo chuẩn Restful nhưng sẽ cho người dùng chỉnh sửa, custom lại theo ý của người dùng

Người dùng sửa tại textbox có label `Custom Endpoint` thành `list` thì endpoint mới sẽ là `vin-manage-ai/api/user-management/list` sẽ là get list.

Mục `Description` miêu tả về API (Optional)

Tại mục `Response` (bắt buộc) người dùng sẽ paste success response này vào sau khi lưu thì sẽ sử dụng API để phân tích và biết được đâu là root object và tạo ra 20 items cho nó <Người dùng có thể tự yêu chon yêu cầu với max là 50 items>. Phân tích biết đâu là paging để nhập liệu cho chính xác và các dữ liệu khác liên quan.

Cho người dùng điền miêu tả thêm cho AI (Optional) cho phần response này.

Cho phép chọn lại method 

- Ví dụ JSON structure:

```JSON
{
  "data": [
    {
      "id": 1,
      "title": "Smartphone X",
      "price": 799.99,
      "description": "Latest smartphone with advanced features",
      "category": "electronics",
      "brand": "TechCo",
      "stock": 50,
      "image": "https://fakeapi.net/images/smartphone.jpg",
      "specs": {
        "color": "black",
        "weight": "180g",
        "storage": "128GB"
      },
      "rating": {
        "rate": 4.5,
        "count": 120
      }
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 20
  }
}
```

Thì root chính là:
```JSON
{
      "id": 1,
      "title": "Smartphone X",
      "price": 799.99,
      "description": "Latest smartphone with advanced features",
      "category": "electronics",
      "brand": "TechCo",
      "stock": 50,
      "image": "https://fakeapi.net/images/smartphone.jpg",
      "specs": {
        "color": "black",
        "weight": "180g",
        "storage": "128GB"
      },
      "rating": {
        "rate": 4.5,
        "count": 120
      }
    }
```

Cho phép custom lại status code.

Làm tương tự với các API khác

### Thêm mới / Xoá API

Người dùng có thể thêm mới 1 api khác ngoài các API được tạo tự động trên và người dùng hoàn toàn có thể xoá các API đã tạo hoặc được tạo tự động

Ví dụ muốn thêm api `approve` thì sẽ điền thông tin miêu tả + endpoint + http method + etc. Như ví dụ tôi đưa sẽ thành `vin-manage-ai/api/user-management/approve`

# Mong muốn

Khi sử dụng call API qua app với các thông tin về api đã define thì sẽ đi đúng như luồng thật từ HTTP Method map, response đúng

Các dữ liệu chỉ gen 1 lần và lưu lại database và chỉnh sửa thao tác qua database

# Công nghệ & Kiến trúc

- NodeJS
- UI React + i18n (bắt buộc) hỗ trợ các ngôn ngữ sau: Vietnamese, English, China, Japanese
- AI (Support multi key like ChatGPT, Gemini, Grok, etc.)
- Docker
- Mongo
- Clean Architecture