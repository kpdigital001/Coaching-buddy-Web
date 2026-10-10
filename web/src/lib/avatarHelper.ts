export const AVATAR_MAP: Record<string, string> = {
  EduBee: '/assets/avatars/EduBee.png',
  Quizzy: '/assets/avatars/Quizzy.png',
  SmartySpark: '/assets/avatars/SmartySpark.png',
  StudyBuddy: '/assets/avatars/StudyBuddy.png',
};

export const DEFAULT_AVATAR = '/assets/avatars/EduBee.png';

export function getAvatarUrl(avatarName?: string | null): string {
  if (!avatarName) return DEFAULT_AVATAR;
  return AVATAR_MAP[avatarName] || DEFAULT_AVATAR;
}
