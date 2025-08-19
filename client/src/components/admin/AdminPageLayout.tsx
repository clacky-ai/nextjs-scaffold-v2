import { ReactNode } from 'react';
import { Link } from 'wouter';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { ChevronRight, Home } from 'lucide-react';
import { useNavigationStore } from '@/stores/admin/navigationStore';
import { BreadcrumbItem } from '@/stores/admin/types';

interface AdminPageLayoutProps {
  children: ReactNode;
  title?: string;
  description?: string;
  actions?: ReactNode;
  className?: string;
}

function BreadcrumbNav({ breadcrumbs }: { breadcrumbs: BreadcrumbItem[] }) {
  if (breadcrumbs.length <= 1) {
    return null;
  }

  return (
    <nav className="flex items-center space-x-1 text-sm text-gray-600 mb-4">
      {breadcrumbs.map((item, index) => {
        const isLast = index === breadcrumbs.length - 1;
        const Icon = item.icon;
        
        return (
          <div key={index} className="flex items-center">
            {index > 0 && (
              <ChevronRight className="h-4 w-4 mx-2 text-gray-400" />
            )}
            
            {item.href && !isLast ? (
              <Link href={item.href}>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-auto p-1 text-gray-600 hover:text-gray-900"
                >
                  <div className="flex items-center">
                    {Icon && <Icon className="h-4 w-4 mr-1" />}
                    {item.label}
                  </div>
                </Button>
              </Link>
            ) : (
              <div className={cn(
                "flex items-center px-1",
                isLast ? "text-gray-900 font-medium" : "text-gray-600"
              )}>
                {Icon && <Icon className="h-4 w-4 mr-1" />}
                {item.label}
              </div>
            )}
          </div>
        );
      })}
    </nav>
  );
}

export function AdminPageLayout({ 
  children, 
  title, 
  description, 
  actions,
  className 
}: AdminPageLayoutProps) {
  const { breadcrumbs } = useNavigationStore();

  return (
    <div className={cn("flex-1 flex flex-col min-h-0", className)}>
      {/* Page Header */}
      <div className="flex-shrink-0 bg-white border-b border-gray-200 px-6 py-4">
        <BreadcrumbNav breadcrumbs={breadcrumbs} />
        
        <div className="flex items-center justify-between">
          <div className="min-w-0 flex-1">
            {title && (
              <h1 className="text-2xl font-bold text-gray-900 truncate">
                {title}
              </h1>
            )}
            {description && (
              <p className="mt-1 text-sm text-gray-600">
                {description}
              </p>
            )}
          </div>
          
          {actions && (
            <div className="flex items-center space-x-3 ml-4">
              {actions}
            </div>
          )}
        </div>
      </div>

      {/* Page Content */}
      <div className="flex-1 overflow-auto bg-gray-50">
        <div className="p-6">
          {children}
        </div>
      </div>
    </div>
  );
}
