---
title: AI润色-两个数组的交集
date: 2026-04-07
tags:
  - 算法
  - 数组
  - 哈希
---

## 题目描述

给定两个数组 `nums1` 和 `nums2`，编写一个函数来计算它们的**交集**（结果中的每个元素必须唯一）。

> **约束条件：**
> - `1 <= nums1.length, nums2.length <= 1000`
> - `0 <= nums1[i], nums2[i] <= 1000`

---

## 解题思路

本题采用 **哈希映射（Hash Map）** 思想，利用数据范围较小的特点，用数组模拟哈希表：

1. 创建一个长度为 **1001** 的标记数组 `array`（因为元素最大值为 1000）
2. 遍历 `nums1`，将出现过的元素在 `array` 对应位置标记为 `1`
3. 遍历 `nums2`，若 `array[当前元素] == 1`，说明该元素是交集的一部分：
   - 将其加入结果数组 `ret`
   - 将标记置回 `0`，避免重复添加
4. 返回 `ret`，通过指针参数 `returnSize` 返回交集长度

### 复杂度分析

| 指标 | 复杂度 | 说明 |
|:---|:---|:---|
| 时间复杂度 | O(n + m) | 分别遍历两个数组各一次 |
| 空间复杂度 | O(k) | k = 1001，固定大小的辅助数组 |

---

## 代码实现

```c
int* intersection(int* nums1, int nums1Size, int* nums2, int nums2Size, int* returnSize) {
    // 标记数组：记录 nums1 中出现过的元素
    int array[1001] = {0};

    // 结果数组：交集大小取两数组较小值即可
    int* ret = (int*)malloc(sizeof(int) * (nums1Size < nums2Size ? nums1Size : nums2Size));
    int index = 0;

    // 第一步：用 array 标记 nums1 中出现的所有元素
    for (int i = 0; i < nums1Size; i++) {
        array[nums1[i]] = 1;
    }

    // 第二步：遍历 nums2，查找交集
    for (int i = 0; i < nums2Size; i++) {
        if (array[nums2[i]] == 1) {
            ret[index++] = nums2[i];
            array[nums2[i]] = 0;  // 置零防重复
        }
    }

    *returnSize = index;
    return ret;
}
```

---

## 关键要点

- **为什么用数组而不用真正的哈希表？** — 因为题目限定元素值在 `[0, 1000]` 范围内，直接用下标映射比哈希表更快更省空间
- **为什么找到后要置零？** — 同一元素可能在 `nums2` 中多次出现，置零保证每个交集中的元素只被记录一次
- **`returnSize` 的作用？** — C 语言无法直接返回数组长度，通过输出参数传递
