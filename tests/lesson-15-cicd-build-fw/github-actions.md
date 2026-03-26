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
