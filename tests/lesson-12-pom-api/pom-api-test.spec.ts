import { test, expect } from "@playwright/test";
import { ConduitApi } from "../../api/conduit.api";

const baseUrl = "https://conduit-api.bondaracademy.com/api";
const email = "thucute@mailsac.com";
const password = "Test123@";
let slug: string;
let cmtTotal: any[] = [];
let deletedCmt: any[] = [];

let title = 'Exercise Lesson 789';
let desc = 'How to use API to create article';
let body = 'Hello testing world';
let tagList = ['Playwright Viet Nam', 'pw', 'pw-k11, k11-practice'];

test.describe("Auto API flow: Exercise 11 @api", () => {
    let conduitApi: ConduitApi;

    test.beforeEach(async ({ request }) => {
        conduitApi = new ConduitApi(request, baseUrl);
    });

    test("Test 1: Sign up successfully", async () => {
        const response = await conduitApi.signUp();
        //Verify status code
        expect(response.status()).toBe(201);
    });

    test("Test 2: Login and create an article", async () => {
        await test.step("Login", async () => {
            const response = await conduitApi.logIn(email, password);
            //Verify status code
            expect(response.status()).toBe(200);
        });

        await test.step("Create an article", async () => {
            await conduitApi.getToken(email, password);
            const response = await conduitApi.createArticle(title, desc, body, tagList);
            const resBody = await response.json();
            // Verify status code
            expect(response.status()).toBe(201);
            //Get slug
            slug = resBody.article.slug;
        });
    });

    test("Test 3: Add 5 comments in Article", async () => {
        await conduitApi.getToken(email, password);

        for (let i = 0; i < 5; i++) {
            let bodyCmt = `Comment 0${i}`;
            const response = await conduitApi.createComment(slug, bodyCmt);
            const resBody = await response.json();
            cmtTotal.push(resBody.comment.id);

            //Verify status code
            expect(response.status()).toBe(200);
        }
        //verify add 5 cmts
        expect(cmtTotal.length).toBe(5);
        //Get comment 2 and comment 5
        deletedCmt = [cmtTotal[1], cmtTotal[4]];
    });

    test("Test 4: Delete cmt 2 and cmt 5 successfully", async ({ request }) => {
        await test.step("Delete cmt 2 and cmt 5", async () => {
            await conduitApi.getToken(email, password);
            //Delete cmt
            for (let id of deletedCmt) {
                const response = await conduitApi.deleteComment(slug, id);

                //Verify status code
                expect(response.status()).toBe(200);
            };
        });
    });


    test("Test 6: Xóa article đã tạo ở test 2", async () => {
        await conduitApi.getToken(email, password);
        const response = await conduitApi.deleteArticle(slug);
        //Verify status code
        expect(response.status()).toBe(204);
    });
});


