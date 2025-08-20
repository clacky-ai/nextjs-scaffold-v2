import { useEffect } from 'react';
import { useLocation } from 'wouter';

interface RedirectProps {
  to: string;
  replace?: boolean;
}

export function Redirect({ to, replace = true }: RedirectProps) {
  const [, navigate] = useLocation();

  useEffect(() => {
    navigate(to, { replace });
  }, [to, replace, navigate]);

  return null; // 不渲染任何内容
}

// 基础重定向页面组件
export function RedirectPage({ to, replace = true }: RedirectProps) {
  return <Redirect to={to} replace={replace} />;
}

// 高阶函数：创建重定向组件
export function createRedirectPage(to: string, replace: boolean = true) {
  return function RedirectPageComponent() {
    return <RedirectPage to={to} replace={replace} />;
  };
}