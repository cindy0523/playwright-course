# CI/CD and Playwright testing

## Pipeline:
Để ship 1 phần mềm tới user thật, team sử dụng 1 pipeline - một chuỗi các bước tự động để 
- Build project: ghép các file, cài thư viện, tạo ra phiên bản chạy được
- Run test: chạy test tự dộng để kiểm tra code có lỗi ko, nếu testcase fail, pipeline sẽ dừng lại (nghĩa là code có vấn đề)
- Deploy code

## Devops Princples:

**1. Collaboration(Hợp tác):**
Dev, QC, Ops làm chung 1 qui trình thay vì tách rời, mục tiêu để giảm lỗi khi release
- Ví dụ: Dev push code --> auto test chạy --> deploy

**2. Automation (Tự động hóa):**
Tự động hóa càng nhiều bước càng tốt:
- build
- test
- deploy

**3. Continuous Integration (Tích hợp liên tục):**
- Continuous Integration (CI) = Dev merge/ push code liên tục vào repository
- Mỗi lần push sẽ tự: clone code - build project - run test
- Mục tiêu: phát hiện bug sớm

**4. Continuous Delivery/ Continuous Deployment:**
Sau khi test passed, code có thể deploy tự động sang environment
- Continuous Delivery: deploy manual
- Continuous Deployment: deploy tự động.

**5. Fast feedback (Phản hồi nhanh):**
Pipeline chạy nhanh để Dev biết lỗi sớm
- Ví dụ: Dev push code --> 5 phút sau CI báo test fail --> Dev sửa ngay

**6. Monitoring (Giám sát hệ thống):**
Sau khi deploy phải monitor system:
- error
- performance
- crash

## Playwright in CI/CD pipeline
Nó sẽ nằm theo thứ tự tuần tự:
1. Build
2. Test
3. Deploy
4. **Run Playwright E2E Test**

## 2 cách chạy Playwright trên CI/CD

### Cách 1. Direct install:
```bash
npm ci
npx playwright install --with-deps
npx playwright test
```
- npm ci: cài dependency từ package.json và package-lock.json)
- npx playwright install --with-deps: tải browser cần cho PW: chromium, firefox, webkit)
- npx playwright test: run automation

**Nhược điểm:**
- Chậm, mỗi lần PW chạy lại phải download browser ~300MB
- Tốn thời gian CI

### Cách 2: Docker Image (Cách Pro hơn)
- **Docker** là 1 tool để tạo và chạy **container**
- **Container** là 1 môi trường chạy app độc lập, nhẹ và tách biệt khỏi hệ điều hành chính
- **Docker image** là file định nghĩa container (1 template environment)

Đối với cách này thì:
```bash
npm ci
npx playwright test
```

Không cần npx playwright install thì browser đã có trong Docker image

## playwright.config.ts
```ts
const baseURL = process.env.E2E_BASE_URL || 'http:localhost:8080';
```
**Giải thích:**
- Sử dụng biến môi trường "E2E_BASE_URL" đc set bởi hệ thống CICD, điều này cho phép mình ko cần phải hardcode value và có thể sử dụng những testcases giống nhau chạy đc trên nhiều môi trường (nó sẽ linh hoạt hơn)
- Nếu ko dùng biến "E2E_BASE_URL" thì mặc định sẽ dùng local host

```ts
retries: process.env.CI ? 2 : 0,
```
**Giải thích:**
- retries cho phép tự động chạy lại script nếu test run fail mà mình ko cần phải thử lại manual
- retries rất hữu ích cho việc xử lý flaky test
- Sử dụng biến môi trường CI, mình sẽ check xem test run fail ở CI hay Local env
- Dòng trên có nghĩa là trong CI/CD, mình sẽ retry 2 lần nếu fail, còn nếu pass thì 0 lần
- Rất hiệu quả vì hầu hết CI/CD provider đều tự động đặt biến env này bằng True

```ts
workers: process.env.CI ? 1 : undefined,
```
**Giải thích:**
- Config này cho Playwright biết có bao nhiêu worker để chạy parallel
- Dòng này cho thấy chỉ có 1 worker đang chạy

```ts
reporter: [
    ['list'],
    ['junit', { outputFile: 'reports-e2e/junit.xml' }],
    ['html', { outputFolder: 'report-e2e/html', open: 'never' }],
],
use: {
    baseURL,
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
}
```
**Giải thích:**
- Về mặt trouble shoot và hiểu các test script đang hoạt động ra sao, thì report rất quan trọng
- chụp hình, quay video lỗi, và trace cho phép đi từng bước để xem

```ts
webServer: startLocalServer
    ? {
        command: 'npm run dev -- --host 127.0.0.1 --port: 8080 --strictPort',
        url: baseURL,
        reuseExistingServer: true,
        timeout: 120_000,
    }
    : undefined,
```
**Giải thích:**
- command: lệnh chạy server (thứ chạy tay)
- url: link mà PW dùng để check server ready chưa, nếu url trả response OK -> test bắt đầu
- reuseExistingServer: 
  - true: nếu server run rồi thì ko start lại
  - false: luôn start server mới
- timeout: thời gian chờ server start (120 * 1000 là chờ 120s ~ 2 phút, viết vậy cho dễ đọc), nếu quá thời gian chờ mà chưa start thì fail luôn

**Cái này giúp:**
- K cần nhớ chạy server trước khi test
- Tránh lỗi "test fail vì quên bật app"
- CI/CD chạy tự động (ko cần có người manually bật server, nên cần config webServer để PW auto bật giúp)

## Fork repository là gì?
- Copy repo của người khác về Github account của bạn và tha hồ edit nhưng ko ảnh hưởng tới repo gốc trừ khi đề xuất Merge
- Fork khác Clone ở chỗ, Clone sẽ **copy về máy local**, còn Fork sẽ **copy về Github cá nhân**

## Jenkins

- Tải sẵn Docker Desktop và setup Linux (lõi hệ điều hành) + Ubuntu (hệ điều hành)

### Setup Jenkins
1. Mở app Docker Desktop lên để chạy engine
2. Clone repo này về: https://github.com/vdespa/install-jenkins-docker/
3. Mở Powershell, trỏ tới thư mục chứa cái này, và nhập câu lệnh
```bash
docker build -t my-jenkins .
```
- Lệnh này build docker image từ Docker file và đặt tên image là my-jenkins, dấu . là lấy docker file trong folder hiện tại
- Lần đầu đợi nó build mất 2-10p, vì phải tải base image, mấy lần sau nhanh hơn tầm 1-2p vì docker cache
4. Start Jenkins
```bash
docker compose up -d
```
5. Mở Jenkins từ link này: http://localhost:8080/
6. Với lần đầu tải Jenkins thì cần thêm 1 vài bước setup
- Cần password Admin và pass có sẵn trong file show trên màn hình
- Mở app "Docker Desktop", xổ dropdown list Container ra và click vào container "my-jenkins"
- Nhìn vào "Logs" tab và dò sẽ thấy password, copy và paste vào link local
- Click vào "Install Suggested Plugin" button trên UI Local
- Sau khi tải xong thì click "Skip and continue with Admin" rồi process tiếp tới hết
7. Sau đó vô Jenkins UI, click Setting > Plugins > Available Plugins
- Tìm "Docker pipeline" và install
- Tải tiếp "Ansicolor", "HTML Publisher"

8. Khởi động lại jenkins bằng url: http://localhost:8080/restart
9. Login với Jenkins = admin và password ở bước 6
10. Vào repo Spanish word flip ... và tạo 1 file "Jenkinsfile"
11. Nhập cái này
```groovy
pipeline {
    agent any
    
    options {
        ansiColor('xterm')
    }

    stages {
        stage('build') {
            agent {
                docker {
                    image 'node:22-alpine'
                    reuseNode true
                }
            }
            steps {
                sh 'npm ci'
                sh 'npm run build'
            }
        }

        stage('test') {
            parallel {
                stage('unit tests') {
                    agent {
                        docker {
                            image 'node:22-alpine'
                            reuseNode true
                        }
                    }
                    steps {
                        // Unit tests with Vitest
                        sh 'npx vitest run --reporter=verbose'
                    }
                }
                stage('integration tests') {
                    agent {
                        docker {
                            image 'mcr.microsoft.com/playwright:v1.54.2-jammy'
                            reuseNode true
                        }
                    }
                    steps {
                        sh 'npx playwright test'
                    }
                }
            }
        }

        stage('deploy') {
            agent {
                docker {
                    image 'alpine'
                }
            }
            steps {
                // Mock deployment which does nothing
                echo 'Mock deployment was successful!'
            }
        }

        stage('e2e') {
            agent {
                docker {
                    image 'mcr.microsoft.com/playwright:v1.54.2-jammy'
                    reuseNode true
                }
            }
            environment {
                E2E_BASE_URL = 'https://spanish-cards.netlify.app/'
            }
            steps {
                sh 'npx playwright test'
            }
        }
    }
}
```

### Jobs
- Jobs trong Jenkins là 1 cái task bạn đưa cho Jenkins làm = 1 qui trình tự động

**Ví dụ:**
Job "Run Automation Test":
1. Pull code từ Github
2. Cài dependency
3. Chạy test
4. Xuất report
--> Tất cả gói gọn trong 1 job

**Job gồm:**
- Source code (Github)
- Các bước chạy (steps)
- Khi nào chạy (triggers)
- Xuất report (pass/fail)

### Create Job
- Click Create Job > đặt tên giống repo để dễ xác định
- Chọn 'Pipeline' > click 'OK'
- Scroll xún mục Pipeline > click 'pipeline script from SCM' vì mình sẽ pull pipeline config này về repo mình
- Chọn Git > paste repo link vô 
- Sửa tên branch master thành main
- Click Save
- Làm xong bấm nút Build Now bên trái

### Publish PW report:
Nếu gặp problem dưới local thì đc nhưng trong Jenkins thì ko được, thì report lỗi rất quan trọng:
- Click vào "Workspace" tab của Jenkins - Workspace là thư mục mà Jenkins chứa source code khi chạy job
- Khi chạy 1 job, Jenkins sẽ clone code từ github về, chạy build/test/script và tạo file output (test, report, artifact) --> mọi thứ diễn trong workspace
- Khi xem report index html trên Jenkins sẽ bị lỗi ko render được, bị dính Content Security Policy
