# package.json

## Định nghĩa:
- File này giống như thẻ căn cước kiêm sách HDSD của dự án Nodejs
- Khi khởi tạo dự án bằng lệnh ``` npm init ```, hệ thống sẽ tự tạo ra file package.json

## Giải thích từng dòng:
```json
{
  "name": "pwcourse",
  "version": "1.0.0",
  "description": "",
  "main": "index.js",
  "scripts": {
    "test": "playwright test"
  },
  "keywords": [],
  "author": "",
  "license": "ISC",
  "devDependencies": {
    "@playwright/test": "^1.56.1",
    "@types/node": "^22.5.5",
    "ts-node": "^10.9.2",
    "typescript": "^5.9.3"
  },
  "dependencies": {
    "dotenv": "^17.2.3"
  }
}
```

### 1. Thông tin cơ bản của dự án:

- ```"name": "pwcourse"``` -> tên dự án, ở đây đang đặt là "pwcourse"
- ```"version": "1.0.0"``` -> Phiên bản hiện tại của dự án, hiện đang là phiên bản đầu tiên
- ```"description": ""``` -> phần mô tả dự án, hiện đang để trống
- ```"main": "index.js"``` -> giá trị mặc định mà npm điền sẵn, thường đối với dự án Automation Test thì file main này ít đc xài
- ```"keywords": []``` -> các từ khóa liên quan tới dự án, list dưới dạng mảng giúp người khác dễ tìm thấy dự án của bạn hơn nếu nó đc đăng lên thư viện npm. Hiện đang rỗng
- ```"author": ""``` -> tên tác giả (chính là bạn), mún điền tên thì điền vô
- ```"license": "ISC"``` -> giấy phép bản quyền của dự án, ISC là giấy phép mở cho phép ngkhac vào copy, đọc thỏa mái

### 2. Khu vực script:

```json
"scripts": {
    "test": "playwright test"
  },
```
- scripts trong package.json là nơi mình giao kèo với máy tính từ khóa gì
- Bình thường để test thì nhập terminal ```npx playwright test```, nhưng khi đã khai báo trong Scripts thì chỉ cần nhập ```npm run test``` hay thậm chí ```npm test``` là đủ

### 3. Khu vực dependencies (Thư viện để chạy):

```json
"dependencies": {
    "dotenv": "^17.2.3"
  }
```
- Những thư viện quan trọng của dự án để hoạt động đc cả máy cá nhân và máy chủ

### 4. Khu vực devDependencies (Thư viện để dev/test):

```json
"devDependencies": {
    "@playwright/test": "^1.56.1",
    "@types/node": "^22.5.5",
    "ts-node": "^10.9.2",
    "typescript": "^5.9.3"
  }
```
- Công cụ để gõ code ở máy cá nhân hoặc github actions
- ```@playwright/test```: "Ngôi sao" của dự án này. Đây là thư viện chính của Playwright dùng để viết và chạy các kịch bản test tự động trên trình duyệt.
- ```typescript```: Bộ dịch giúp bạn có thể viết code bằng ngôn ngữ TypeScript (ngôn ngữ có kiểm tra kiểu dữ liệu cực kỳ an toàn) rồi dịch nó ra JavaScript để máy tính hiểu được.
- ```@types/node```: Cung cấp các gợi ý code (IntelliSense) cho các tính năng mặc định của Node.js khi bạn viết bằng TypeScript. Giúp bạn gõ code nhanh và ít bị gõ sai tên hàm.
- ```ts-node```: Công cụ giúp bạn chạy trực tiếp các file TypeScript (.ts) luôn mà không cần phải mất công gõ lệnh dịch thủ công ra file JavaScript (.js) trước rồi mới chạy.

**Note:**
- Dependencies là những tool, lib mà dự án bị "phụ thuộc" vào, phải có mới chạy được
- Giả sử tải code của ai đó trên mạng về, thư mục dự án sẽ k có những Lib này (vì rất nặng, ko ai đẩy lên Git)
- Họ chỉ gửi cho bạn file package.json và bạn mở terminal gõ ```npm instal```
- Máy tính sẽ đọc file package.json, nhìn vào 2 mục: 'dependencies' và 'devDependencies' và tự động tải hết toàn bộ về thư mục 'node_modules'