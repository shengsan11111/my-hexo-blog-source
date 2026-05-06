---
title: 实现strStr()
date: 2026-04-18
tags:
  - 算法
  - 字符串
---

## 题目链接

[实现strStr()](https://leetcode.cn/problems/implement-strstr/)

## 题目描述

给你两个字符串 `haystack` 和 `needle`，请你在 `haystack` 字符串中找出 `needle` 字符串的**第一个匹配项的下标**（下标从 0 开始）。如果 `needle` 不是 `haystack` 的一部分，则返回 **-1**。

### 示例

**示例 1：**
- **输入：** `haystack = "sadbutsad"`, `needle = "sad"`
- **输出：** `0`
- **解释：** "sad" 在下标 0 和 6 处匹配。第一个匹配项的下标是 0，所以返回 0。

**示例 2：**
- **输入：** `haystack = "leetcode"`, `needle = "leeto"`
- **输出：** `-1`
- **解释：** "leeto" 没有在 "leetcode" 中出现，所以返回 -1。

### 约束条件

- `1 <= haystack.length, needle.length <= 10⁴`
- `haystack` 和 `needle` 仅由小写英文字符组成

***

## 解题思路
### 采用双循环暴力解法解决字符串匹配问题
首先先确定 `needle` 字符串的长度是否大于 `haystack` 字符串的长度，如果大于 `haystack` 字符串的长度，直接返回 -1，遍历 `haystack` 字符串，如果 `haystack` 字符串的字符与 `needle` 字符串的第一个字符相同，就继续判断后续的字符是否匹配，如果匹配，就返回当前的下标，否则继续遍历。

## 步骤
1. 计算 `haystack` 字符串和 `needle` 字符串的长度。
  - 如果 `n` 小于 `m`，直接返回 -1。
  - 如果 `n` 大于等于 `m`，则开始遍历 `haystack` 字符串。
2. 遍历 `haystack` 字符串
  - 循环条件：`i < n - m + 1`。因为 `needle` 字符串的长度为 `m`，所以 `haystack` 字符串的下标范围为 `0 ~ n - m`。
  - 一旦出现 `haystack` 字符串的字符与 `needle` 字符串的第一个字符相同，就进入内层循环继续判断后续的字符是否匹配
    - 每次内层循环开始都定义一个标志位 `flag`，初始值为 `1`（每次默认都可以匹配成功）
    - 同时移动 `k` 指针和 `j` 指针，判断后续的字符是否匹配。
      - 一旦出现不匹配的字符，就将 `flag` 设为 `0`，并跳出循环。
    - 内层循环结束后，如果 `flag` 为 `1`，就返回当前的下标 `i`。
    - 如果 `flag` 为 `0`，就继续遍历 `haystack` 字符串的下一个字符。
3. 如果遍历结束后，都没有找到匹配的字符，就返回 `-1`。

###

***

## 代码实现

```c
int strStr(char *haystack, char *needle)
{
    int n = strlen(haystack);
    int m = strlen(needle);
    if(n < m){
        return -1;
    }
    for (int i = 0; i < n - m + 1;i++){
        int k = i;
        if(haystack[k]==needle[0]){
            int flag=1;
            k++;
            for (int j = 1; j < m;j++){
                if(haystack[k]!=needle[j]){
                    flag = 0;
                    break;
                }
                k++;
            }
            if(flag==1){
                return i;
            }
        }
    }
    return -1;
}

```

***

### 时间复杂度
O(n·m) ，其中 `n` 为 `haystack` 字符串的长度，`m` 为 `needle` 字符串的长度。

### 空间复杂度
O(1) ，只需要常量级的空间。