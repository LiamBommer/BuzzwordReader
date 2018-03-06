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
* 密码格式要求:...(editing)
* 性别格式验证

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
