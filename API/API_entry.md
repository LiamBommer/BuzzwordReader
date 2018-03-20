# 词条模块

## search_entry | 搜索词条
> Entry/search_entry | GET

### @param

* search_content

### validate

1. 搜索内容非空

### @return

* result **在搜索结果为空时返回**
> 'empty'

* (搜索结果，一个包含相关词条的数组)
> 每个词条是数组中的一项, 其中又包含:  
id_entry, name, is_open, request, datetime

## search_inte | 搜索释义
> Entry/search_inte | GET

### @param

* entry_id

### validate

1. entry_id非空

### @return

* inte (释义数组)
> id_interpretation, id_entry, id_user, interpretation, resource, datetime, username

* like (点赞数组)
> id_interpretation: like_total
具体用法可看我之前写的接口代码

## like | 点赞
> Entry/like | POST

### @param

* id_user
* id_inte

### validate

1. id_user, in_inte非空...(editing)

### @return

* result
> 'success' **OR** 'failure'

* error_msg	(仅在结果为result == failure时存在)

## dislike | 点灭
> Entry/dislike | POST

### @param

* id_user
* id_inte

### validate

1. id_user, in_inte非空...(editing)

### @return

* result
> 'success' **OR** 'failure'

* error_msg	(仅在结果为result == failure时存在)

## new_entry_request | 请求创建词条
> Entry/new_entry_request | POST

### @param

* entry_name
* entry_id
>  暂未确定用哪个作为参数，都传吧

### validate

1. entry_name非空...(editing)

### @return

* result
> 'success' **OR** 'failure'

* error_msg	(仅在结果为result == failure时存在)


## new_entry | 创建词条
> Entry/new_entry | GET

### @param

* entry_name

### validate

1. entry_name非空...(editing)

### @return

* result
> 'success' **OR** 'failure'

* error_msg	(仅在结果为result == failure时存在)

## insert_inte | 增加释义
> Entry/insert_inte | POST

### @param

* id_entry
* id_user
* inte
* resource

### validate

1. 各种非空...(editing)

### @return

* result
> 'success' **OR** 'failure'

* error_msg	(仅在结果为result == failure时存在)

## edit_entry | 编辑词条
> Entry/edit_entry | POST

### @param

* entry_id
* entry_name
* id_user
* user_identity

### validate

1. 各种非空...(editing)

### @return

* result
> 'success' **OR** 'failure'

* error_msg	(仅在结果为result == failure时存在)

## delete_entry | 删除词条
> Entry/delete_entry | POST

### @param

* entry_id
* id_user
* user_identity

### validate

1. 各种非空...(editing)

### @return

* result
> 'success' **OR** 'failure'

* error_msg	(仅在结果为result == failure时存在)

## edit_inte | 编辑释义
> Entry/edit_inte | POST

### @param

* inte_id
* inte
* resource
* id_user
* user_identity

### validate

1. 各种非空...(editing)

### @return

* result
> 'success' **OR** 'failure'

* error_msg	(仅在结果为result == failure时存在)

## delete_inte | 删除释义
> Entry/delete_inte | POST

### @param

* inte_id
* id_user
* user_identity

### validate

1. 各种非空...(editing)

### @return

* result
> 'success' **OR** 'failure'

* error_msg	(仅在结果为result == failure时存在)
