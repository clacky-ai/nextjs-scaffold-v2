import { ReactNode } from 'react';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, RefreshCw } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface Column<T> {
  key: keyof T | string;
  title: string;
  render?: (value: any, record: T, index: number) => ReactNode;
  width?: string;
  align?: 'left' | 'center' | 'right';
}

interface DataTableProps<T> {
  title?: string;
  columns: Column<T>[];
  data: T[];
  loading?: boolean;
  searchValue?: string;
  onSearchChange?: (value: string) => void;
  onRefresh?: () => void;
  actions?: ReactNode;
  emptyText?: string;
  className?: string;
}

export function DataTable<T extends Record<string, any>>({
  title,
  columns,
  data,
  loading = false,
  searchValue = '',
  onSearchChange,
  onRefresh,
  actions,
  emptyText = '暂无数据',
  className
}: DataTableProps<T>) {
  const renderCell = (column: Column<T>, record: T, index: number) => {
    const value = record[column.key as keyof T];
    
    if (column.render) {
      return column.render(value, record, index);
    }
    
    return value;
  };

  return (
    <Card className={cn("", className)}>
      {(title || onSearchChange || onRefresh || actions) && (
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              {title && (
                <CardTitle className="text-lg font-semibold">
                  {title}
                </CardTitle>
              )}
            </div>
            
            <div className="flex items-center space-x-2">
              {onSearchChange && (
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="搜索..."
                    value={searchValue}
                    onChange={(e) => onSearchChange(e.target.value)}
                    className="pl-10 w-64"
                  />
                </div>
              )}
              
              {onRefresh && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onRefresh}
                  disabled={loading}
                >
                  <RefreshCw className={cn(
                    "h-4 w-4",
                    loading && "animate-spin"
                  )} />
                </Button>
              )}
              
              {actions}
            </div>
          </div>
        </CardHeader>
      )}
      
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                {columns.map((column, index) => (
                  <TableHead 
                    key={index}
                    className={cn(
                      column.align === 'center' && 'text-center',
                      column.align === 'right' && 'text-right'
                    )}
                    style={{ width: column.width }}
                  >
                    {column.title}
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell 
                    colSpan={columns.length} 
                    className="text-center py-8"
                  >
                    <div className="flex items-center justify-center">
                      <RefreshCw className="h-4 w-4 animate-spin mr-2" />
                      加载中...
                    </div>
                  </TableCell>
                </TableRow>
              ) : data.length === 0 ? (
                <TableRow>
                  <TableCell 
                    colSpan={columns.length} 
                    className="text-center py-8 text-gray-500"
                  >
                    {emptyText}
                  </TableCell>
                </TableRow>
              ) : (
                data.map((record, index) => (
                  <TableRow key={index}>
                    {columns.map((column, colIndex) => (
                      <TableCell 
                        key={colIndex}
                        className={cn(
                          column.align === 'center' && 'text-center',
                          column.align === 'right' && 'text-right'
                        )}
                      >
                        {renderCell(column, record, index)}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
