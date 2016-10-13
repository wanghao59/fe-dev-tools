讨论js中复杂数据类型的复制问题（Object,Array等），不讨论基本数据类型（null,undefined,string,number和boolean），这些类型的值本身就存储在栈内存中(string类型的实际值还是存储在堆内存中的，但是js把string当做基本类型来处理 )，不存在引用值的情况。

### 浅拷贝：仅仅将obj对象的引用地址简单的复制了一份给变量obj1，而不是将真正的对象克隆一份，因此obj和obj1指向的都是同一个地址。当修改其中任何一个对象的属性或者添加新属性时，另一个对象也会受到影响。
```js
//如果不是对象和数组，修改后面的变量是不会影响到前面的变量
var hello = "hello";
var world = hello;
world = "world";
console.log(hello);  //hello
```

### 深度拷贝：这就不是拷贝引用地址，而是复制一份新对象给新的变量。

#### Array的slice和concat方法
这两个方法都会返回一个新的数组实例，但是没有执行深复制
```js
var array = [1, [1,2,3], {name:"array"}];
var array_concat = array.concat();
var array_slice = array.slice(0);
//改变array_concat中数组元素的值
array_concat[1][0] = 5;
console.log(array[1]);    //[5,2,3]
console.log(array_slice[1]);  //[5,2,3]
//改变array_slice中对象元素的值
array_slice[2].name = "array_slice";
console.log(array[2].name);   //array_slice
console.log(array_concat[2].name); //array_slice
```
#### JSON对象的parse和stringify
借助这两个方法，也可以实现对象的深复制
`var target = JSON.parse(JSON.stringify(source));`
能够处理JSON格式能表示的所有数据类型，但是对于正则表达式类型、函数类型等无法进行深复制(而且会直接丢失相应的值)，同时如果对象中存在循环引用的情况也无法正确处理
