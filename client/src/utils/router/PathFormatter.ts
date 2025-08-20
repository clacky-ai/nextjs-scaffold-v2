// 路径参数类型
export type RouteParams = Record<string, string | number>;

// 路径格式化工具类
export class PathFormatter {
  // 格式化路径参数
  static formatPath(
    template: string, 
    params: RouteParams = {}, 
    queryParams: RouteParams = {},
    style: 'path' | 'query' = 'path'
  ): string {
    let result = template;
    
    if (style === 'path') {
      // 路径参数风格: /admin/users/:id -> /admin/users/123
      for (const [key, value] of Object.entries(params)) {
        result = result.replace(`:${key}`, String(value));
      }
    } else {
      // 查询参数风格: /admin/users -> /admin/users?id=123
      const baseUrl = template.replace(/\/:[\w]+/g, ''); // 移除路径参数占位符
      if (Object.keys(params).length > 0 || Object.keys(queryParams).length > 0) {
        const allParams = { ...params, ...queryParams };
        const queryString = new URLSearchParams(
          Object.entries(allParams).reduce((acc, [key, value]) => {
            acc[key] = String(value);
            return acc;
          }, {} as Record<string, string>)
        ).toString();
        result = `${baseUrl}?${queryString}`;
      } else {
        result = baseUrl;
      }
    }
    
    return result;
  }
}
