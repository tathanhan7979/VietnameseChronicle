import React from 'react';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';

// Tạo các wrapper component để khắc phục cảnh báo defaultProps
export const DragDropContextWrapper = ({ children, ...props }: React.ComponentProps<typeof DragDropContext>) => {
  return <DragDropContext {...props}>{children}</DragDropContext>;
};

export const DroppableWrapper = ({ children, ...props }: React.ComponentProps<typeof Droppable>) => {
  return <Droppable {...props}>{children}</Droppable>;
};

export const DraggableWrapper = ({ children, ...props }: React.ComponentProps<typeof Draggable>) => {
  return <Draggable {...props}>{children}</Draggable>;
};
