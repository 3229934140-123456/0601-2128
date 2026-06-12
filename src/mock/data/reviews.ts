import { Review } from '@/types';

export const mockReviews: Review[] = [
  {
    id: 'review-1',
    userId: 'user-1',
    activityId: 'act-1',
    rating: 5,
    content: '讲座非常精彩，老师讲解生动有趣，学到了很多书法知识，希望以后多举办这样的活动！',
    createdAt: new Date('2026-06-16'),
  },
  {
    id: 'review-2',
    userId: 'user-2',
    activityId: 'act-2',
    rating: 4,
    content: '音乐会很棒，演奏家们水平很高，唯一不足是音响效果可以再改进一下。',
    createdAt: new Date('2026-06-19'),
  },
];
