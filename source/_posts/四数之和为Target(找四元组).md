---
title: 四数之和为Target(找四元组)
date: 2026-04-13
tags:
  - 算法
  - 数组
  - 双指针
  - 排序
---

## 题目链接

[四数之和](https://leetcode.cn/problems/4sum/)

### 类似题目：三数之和为Target(找三元组) -- Target = 0 

[三数之和](https://leetcode.cn/problems/3sum/)

## 题目描述

给你一个由 `n` 个整数组成的数组 `nums`，和一个目标值 `target`。请你找出并返回满足下述全部条件且**不重复**的四元组 `[nums[a], nums[b], nums[c], nums[d]]`：

- `0 <= a, b, c, d < n`
- `a`、`b`、`c` 和 `d` 互不相同
- `nums[a] + nums[b] + nums[c] + nums[d] == target`

> **注意：**
> - 若两个四元组元素一一对应，则认为两个四元组重复
> - 你可以按**任意顺序**返回答案

### 示例

**示例 1：**
- **输入：** `nums = [1,0,-1,0,-2,2]`, `target = 0`
- **输出：** `[[-2,-1,1,2],[-2,0,0,2],[-1,0,0,1]]`

**示例 2：**
- **输入：** `nums = [2,2,2,2,2]`, `target = 8`
- **输出：** `[[2,2,2,2]]`

### 约束条件

- `1 <= nums.length <= 200`
- `-10⁹ <= nums[i] <= 10⁹`
- `-10⁹ <= target <= 10⁹`

---

## 解题思路

### 方法：快速排序 + 双指针  --- 类似于三数之和的方法（固定第一个数，再固定第二个数，双指针寻找剩余两个数）

1. 先对nums进行升序排序（快排）
2. 固定数1：
    - 需要判断（nums[i] > target && nums[i] >= 0），因为是升序排序，若为true，说明当前固定数1大于target且大于0，说明从此刻开始将是非负数升序，所以四数之和必定大于target，直接break
    - 否则，需要对当前数去重，相同的数值不可以当两次固定数1，需要跳过相同的数
3. 固定数2：
    - 需要判断（nums[i] + nums[j] > target && nums[i] + nums[j] >= 0），同上固定数1的判断逻辑，因为是升序排序，若为true，说明当前固定数1和固定数2之和大于target且大于0，后续数必定大于0，所以四数之和必定大于target，直接break
    - 否则，需要对当前数去重，在固定数1的情况下，相同的数值不可以当两次固定数2，需要跳过相同的数
    - 利用双指针（left和right）指向剩余部分的首尾，不断向中间移动
---

## 步骤

1. 构造cmp函数，用于快速排序,设置为升序排序规则
2. 先对nums进行升序排序（快排）
3. 先为res分配初始容量为16，16个指针的内存空间，再为returnColumnSizes分配16个int类型的内存空间，用于存储每个四元组的列大小，这个题目四元组的列大小为4，所以returnColumnSizes[i]=4
4. 遍历nums数组
    - 循环条件：由于四元组最少包含4个数，所以i < numsSize-3
    - 固定数1：
        - 判断当前是否满足（nums[i] > target && nums[i] >= 0），因为是升序排序，若为true，说明当前固定数1大于target且大于0，说明从此刻开始将是非负数升序，所以四数之和必定大于target，直接break
        - 否则，需要对当前数去重，若相同，需要跳过，因为和上一个固定的数的数值相同，所以不可能组成新的四元组，会出现重复四元组
    - 固定数2：
        - 判断当前是否满足（nums[i] + nums[j] > target && nums[i] + nums[j] >= 0），同上固定数1的判断逻辑，因为是升序排序，若为true，说明当前固定数1和固定数2之和大于target且大于0，后续数必定大于0，所以四数之和必定大于target，直接break
        - 否则，需要对当前数去重，在固定数1的情况下，相同的数值不可以当两次固定数2，需要跳过相同的数
        - newTarget=target-nums[i]-nums[j]，newTarget是用于在剩余部分寻找和为newTarget的两个数
        - 最内层通过双指针left和right，计算四数之和
        - 用sum存放当前left和right指向的数之和
            - 若sum等于newTarget
                - 需要将对应的left和right指向的数加入到res中，同时将left和right指向的数的列大小设置为4，将returnSize加1
                - 如果res和returnColumnSizes的容量不足，需要重新分配内存空间(扩大容量)，再将对应的left和right指向的数加入到res中
                - 跳过重复的left和right指向的数，避免重复四元组
                - left++，right--
            - 若sum小于newTarget，说明left指向的数太小，需要将left指针右移
            - 若sum大于newTarget，说明right指向的数太大，需要将right指针左移
5. 返回res

---

## 代码实现

```c
int cmp(const void *a, const void *b) {
    return *(int*)a - *(int*)b;
}

int** fourSum(int* nums, int numsSize, int target, int* returnSize, int** returnColumnSizes) {
    *returnSize = 0;
    // 数组长度小于4，直接返回空指针
    if (numsSize < 4) 
        return NULL;
    // 先对nums进行升序排序（快排）
    qsort(nums, numsSize, sizeof(int), cmp);

    int current_size = 16;
    int** res = (int**)malloc(current_size * sizeof(int*));
    *returnColumnSizes = (int*)malloc(current_size * sizeof(int));

    for (int i = 0; i < numsSize - 3; i++) {
        // 剪枝1：固定数1已经太大
        if (nums[i] > target && nums[i] >= 0) 
            break;
        // 去重固定数1
        if (i > 0 && nums[i] == nums[i - 1]) 
            continue;

        for (int j = i + 1; j < numsSize - 2; j++) {
            // 剪枝2：固定数1和固定数2的和已经太大
            if (nums[i] + nums[j] > target && nums[i] + nums[j] >= 0) 
                break;
            // 去重固定数2
            if (j > i + 1 && nums[j] == nums[j - 1]) 
                continue;

            int left = j + 1, right = numsSize - 1;
            //防止数据溢出
            long long newTarget = (long long)target - nums[i] - nums[j];

            while (left < right) {
                int sum = nums[left] + nums[right];
                if (sum == newTarget) {
                    if (*returnSize == current_size) {
                        current_size *= 2;
                        res = (int**)realloc(res, current_size * sizeof(int*));
                        *returnColumnSizes = (int*)realloc(*returnColumnSizes, current_size * sizeof(int));
                    }
                    // 保存四元组
                    int* temp = (int*)malloc(4 * sizeof(int));
                    temp[0] = nums[i];
                    temp[1] = nums[j];
                    temp[2] = nums[left];
                    temp[3] = nums[right];
                    res[*returnSize] = temp;
                    (*returnColumnSizes)[*returnSize] = 4;
                    (*returnSize)++;

                    // 跳过重复的第三、第四个数
                    while (left < right && nums[left] == nums[left + 1]) 
                        left++;
                    while (left < right && nums[right] == nums[right - 1]) 
                        right--;
                    left++;
                    right--;
                } else if (sum < newTarget) {
                    left++;
                } else {
                    right--;
                }
            }
        }
    }
    return res;
}
```

---

### 时间复杂度

O(n³) 快速排序O(nlogn)+三重循环O(n³)

### 空间复杂度

O(logn) 快速排序需要的栈空间 - 辅助空间
O(k) k为不重复四元组的数量，最坏情况 O(n³) - 总体空间
