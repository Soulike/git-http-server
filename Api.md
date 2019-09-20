# 接口文档

由 git 客户端调用的路由不在文档中体现。请查阅 git 官方文档。

## `/createRepo`

- 功能说明：创建一个空 Repository
- 请求方法：POST
- 请求体：
```ts
{
    repoName: string,   // 被创建的 Repository 的名字
}
```
- 响应体：无
- 其他说明：
  - 当创建失败时，返回 HTTP 403，可能因用户未登录或存储库已存在

## `/deleteRepo`

- 功能说明：删除一个 Repository
- 请求方法：POST
- 请求体：
```ts
{
    repoName: string,   // 被删除的 Repository 的名字
}
```
- 响应体：无
- 其他说明：
  - 当删除失败时，返回 HTTP 403，可能因用户未登录或存储库不存在