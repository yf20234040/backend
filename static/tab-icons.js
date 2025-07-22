// tabBar图标配置
// 由于uni-app的tabBar需要实际的图片文件，这里提供图标配置
// 实际项目中需要准备对应的PNG图片文件

export const tabIcons = {
  home: {
    normal: '🏠',
    active: '🏠'
  },
  documents: {
    normal: '📄',
    active: '📄'
  },
  ai: {
    normal: '🤖',
    active: '🤖'
  },
  team: {
    normal: '👥',
    active: '👥'
  },
  profile: {
    normal: '👤',
    active: '👤'
  }
};

// 图标文件路径配置
export const iconPaths = {
  home: {
    normal: '/static/tab-home.png',
    active: '/static/tab-home-active.png'
  },
  documents: {
    normal: '/static/tab-doc.png',
    active: '/static/tab-doc-active.png'
  },
  ai: {
    normal: '/static/tab-ai.png',
    active: '/static/tab-ai-active.png'
  },
  team: {
    normal: '/static/tab-team.png',
    active: '/static/tab-team-active.png'
  },
  profile: {
    normal: '/static/tab-profile.png',
    active: '/static/tab-profile-active.png'
  }
}; 