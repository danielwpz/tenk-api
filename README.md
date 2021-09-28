# 10k API

## Install
- `npm install @danielwpz/tenk-api`
- `import api from '@danielwpz/tenk-api'`

## API
- `init(network)`
  - 初始化api对象
  - network必须为`mainnet`或`testnet`
- `isSignedIn(): bool`
  - 判断当前用户是否登录
- `signIn()`
  - 引导用户登录
  - 该方法会强制页面重定向到near钱包，登录完成后再跳回来
- `getAccountId(): string | null`
  - 获取当前用户id，如果未登录则返回null
- `getTotalSupply(): Promise<number>`
  - 获取总发行NFT数量
- `getRemainingCount(): Promise<number>`
  - 获取剩余可购买的NFT数量
- `getUnitPrice(): Promise<string>`
  - 获取NFT购买单价
- `purchase(callbackUrl)`
  - 购买
  - 该方法会强制重定向当前页面至near钱包，购买完成后跳转回callbackUrl参数指定的页面
  - callbackUrl：用户成功购买NFT后，near钱包跳转地址
- `getMyCollections(): Promise<NFT[]>`
  - 获取我的收藏列表
- `getNFTs(from): Promise<NFT[]>`
  - 获取所有NFT列表
  - from：分页参数
- `getSuccessResult(): Promise<NFT>`
  - 用在purchase成功回调之后，获取purchase返回的值
