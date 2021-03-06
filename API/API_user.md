# 用户模块

## login | 登录
> User/login

### @param

* email **OR** phone
* password

### validate

1. 邮箱与手机号码一个可为空，后端自动验证: 取一个不为空的进行登录。
* 密码不为空
* 密码格式要求:...(editing)

### @return

* result
> 'success' **OR** 'failure'

* error_msg	(仅在结果为result == failure时存在)
* row  
> 登录成功的用户信息:  
id_user, email, phone, password, username, is_banned, identity

## signup | 注册
> User/signup

### @param

* username
* password
* email
* phone
* gender
* profile

### validate

1. 邮箱与手机号码一个可为空，后端自动验证: 取一个不为空的进行登录。
* 密码, 用户名, 性别均不为空
* 性别格式验证

**NEW EDIT**
* 用户名：中文、字母、数字、下划线，3-16个字符
> /[\x4E00-\x9FA5\w]{3,16}/

* 密码：大小写字母和数字的组合，没有特殊字符，6-16个字符
> /^[\w\d]{6,16}$/

### @return

* result
> 'success' **OR** 'failure'

* error_msg	(仅在结果为result == failure时存在)

## 获取用户信息
> User/getInfo

### @param

* username

### validate

1. 用户名不为空

### @return

* result
> 'success' **OR** 'failure'

* error_msg	(仅在结果为result == failure时存在)
* row
> 用户信息  
email, phone, identity, gender, profile

## 密码修改
> User/pwEdit

### @param

* username
* pw_origin
* pw_new_1
* pw_new_2

### validate

1. 三项密码均非空
* 新旧密码不同...(editing)
* 新密码格式要求:...(editing)

### @return

* result
> 'success' **OR** 'failure'

* error_msg	(仅在结果为result == failure时存在)

## search_user | 根据用户id搜索用户名
> User/search_user | GET

### @param

* id_user

### validate

1. 搜索内容非空

### @return

* result **在搜索结果为空时返回**
> 'empty'

* (搜索结果，一个包含用户信息的数组, 只有一条！)
> id_user, username
直接用result.username就行
