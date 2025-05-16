import React from "react";
import { FormField, FormItem, FormControl, FormLabel } from "@/components/ui/form";
import { Checkbox } from "@/components/ui/checkbox";

export const NewsPermissionField = ({ control }: { control: any }) => {
  return (
    <FormField
      control={control}
      name="can_manage_news"
      render={({ field }) => (
        <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-3">
          <FormControl>
            <Checkbox
              checked={field.value}
              onCheckedChange={field.onChange}
            />
          </FormControl>
          <div className="space-y-1 leading-none">
            <FormLabel>Quản lý tin tức</FormLabel>
            <p className="text-xs text-muted-foreground">
              Thêm, sửa, xóa bài viết tin tức
            </p>
          </div>
        </FormItem>
      )}
    />
  );
};