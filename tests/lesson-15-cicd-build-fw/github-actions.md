# Github Actions with Playwright

## Setup Github Actions
1. Vào repo trên Github
2. Click "Actions" tab
3. Click "set up a workflow yourself" hyperlink
4. Sửa tên file yml thành "cicd.yml"
5. Viết file yml:
```yaml
name: CI

on:
  push:
    branches: [ main ]
  pull_request:
  workflow_dispatch:

concurrency:
  group: ci-${{ github.ref }}
  cancel-in-progress: true

jobs:
  build:
    name: Build
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: 22
          cache: npm

      - name: Install deps
        run: npm ci

      - name: Build app
        run: npm run build

  test_unit:
    name: Unit Tests
    runs-on: ubuntu-latest
    needs: build
    steps:
      - uses: actions/checkout@v4
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: 22
          cache: npm
      - name: Install deps
        run: npm ci
      - name: Run Vitest
        run: npx vitest run --reporter=verbose

  deploy:
    name: Deploy (mock)
    runs-on: ubuntu-latest
    needs: [test_unit]
    container:
      image: alpine:latest
    steps:
      - name: Mock deployment
        run: echo 'Mock deployment was successful!'

```
6. Click vào "Commit changes" để commit
7. Có pop up hiện ra: điền commit message và chọn radio button đầu tiên
8. Để xem quá trình, click lại vào tab "Actions" và sẽ thấy 1 workflow đang running
9. Click vô sẽ thấy overview đc cái pipeline đang chạy tới stage nào
10. Click tab "Code", tạo 1 branch mới = cách click nút "Main"
11. Tạo branch: feature/playwright-test rồi click nút "Create"
12. Lúc này file yaml nằm trong thư mục ".github/workflow" > "cicd"
13. Có thể edit trực tiếp file yaml trên github bằng nút "edit"
14. Để thêm PW vào Github actions, có 2 cách:
- Install PW browsers và dependency vào
- Hoặc dùng PW Docker image

## Github Actions: Playwright Integration

### Cách 1: Tải Playwright browser và dependency

1. Thêm đoạn này vào file cicd.yml có sẵn

```yaml
 test_integration:
    name: Integration Tests (Playwright)
    runs-on: ubuntu-latest
    needs: build
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@4
        with:
          node-version: 22
      - name: Install dependencies
        run: npm ci
      - name: Install Playwright browsers
        run: npx playwright install --with-deps
      - name: Run Playwright tests
        run: npx playwright test
```
2. Click "Commit changes" và click vào tab "Actions" để xem Pipeline run như thế nào

**Giải thích từng dòng file yaml:**
```yaml
name: CI
```
- **name**: Tên pipeline hiển thị trong Github Actions
```yaml
on:
  push:
    branches: [ main ]
  pull request:
  workflow_dispatch:
```
- **on**: trigger khi nào pipeline chạy

Trong đó:
- **push**: khi bạn push code lên nhánh 'main' thì pipeline chạy
- **pull request**: khi bạn tạo PR thì cũng chạy pipeline luôn
- **workflow_dispatch**: cho phép bạn bấm nút chạy tay trong Github Actions

```yaml
concurrency:
  group: ci-${{github.ref}}
  cancel-in-progress: true
```
- **concurrency**: config giới hạn chạy song song, dùng để chống việc chạy job trùng nhau, tránh gây tốn tài nguyên + conflict
- **group** = 1 nhóm pipeline --> github nhìn vào sẽ check pipeline nào cùng 1 nhóm để quyết định rule (cancel/ không cancel)
- **ci**: prefix đặt tên (tùy ý)
- **github.ref** (biến của Github) = tên branch hiện tại
--> mỗi branch là 1 group riêng biệt, pipeline branch A ko impact pipeline branch B
- **cancel-in-progress**: true --> nghĩa là nếu có 1 pipeline đang chạy trong group mà pipeline mới trigger thì cancel luôn cái cũ

**Lưu ý:**
- Nó ko cancel các branch vs nhau
- Nó chỉ cancel trong cùng 1 group
- Nếu muốn cancel toàn repo thì phải setup kiểu khác

```yaml
jobs:
```
- trong github actions, **jobs** = 1 máy ảo riêng và mỗi job nhỏ bên trong chạy độc lập và ko share data nếu ko config thêm

```yaml
build:
  name: Build
  runs-on: ubuntu-latest
```
- **build:** tên tự đặt cho job, có thể đổi tên, đặt sao cho dễ hiểu là ok
- **runs-on: ubuntu-latest**: Github cấp 1 máy ảo để job 'build' chạy trên hệ điều hành linux ubuntu bản mới nhất

```yaml
    steps:
      - name: Checkout
        uses: actions/checkout@v4
```
- **steps:** các bước thực hiện job build này, các bước thực hiện tuần tự từ trên > xuống
- **name:** tên step, tự đặt tùy ý miễn meaningful
- **uses:** mượn lệnh có sẵn của Github Actions để làm 1 tác vụ
- **actions**: tên tổ chức sở hữu actions trên github
- **checkout**: đi vào repo của bạn, copy toàn bộ source code và dán vào máy ảo Ubuntu
- **v4**: version 4 của Github Actions
- **uses: actions/checkout@v4**: máy ảo Ubuntu mở ra sẽ hoàn toàn trống rỗng.
Bước này sử dụng 1 action có sẵn của Github để tải toàn bộ code của repository của bạn về máy ảo để xử lý

```yaml
- name: Setup Node.js
  uses: actions/setup-node@v4
  with:
    node-version: 22
    cache: npm
```

- Step này có **name** là "Setup Node.js"
- **uses: actions/setup-node@v4**: setup thư viện Nodejs
- **with**: truyền action thêm
- **node-version: 22**: chỉ định cài đặt nodejs version 22
- **cache: npm**:  tính năng cache - nó ghi nhớ các thư viện đã tải. Nếu bạn không thêm thư viện mới, nó sẽ lấy từ bộ nhớ đệm để chạy nhanh hơn

```yaml
      - name: Install deps
        run: npm ci

      - name: Build app
        run: npm run build
```
- **run**: run để tự gõ lệnh vào terminal: "npm ci"
- **npm ci**: ci viết tắt của 'clean install' hoặc 'continous integration'
  - 'npm ci' là lệnh dùng cho github actions / server, dùng để cài đặt chính xác 100% những gì trong file package.json và không lệch dù chỉ 1 dấu chấm
  (khác với 'npm install' dùng ở máy cá nhân và có thể auto update package.json ở ver mới hơn nếu cho phép)
  - npm ci nếu phát hiện package.json và package-lock.json khác nhau, nó sẽ dừng lại báo lỗi chứ ko tự sửa
  (so với npm install, nếu bạn sửa file package.json, nó sẽ tự update lại file đó)
  - npm ci nhanh hơn npm install vì nó chỉ cài đặt theo đúng như những j ở package-lock.json
  - npm ci xóa sạch thư mục 'node_module' cũ rồi tải mới hoàn toàn, còn npm install thì overwrite

