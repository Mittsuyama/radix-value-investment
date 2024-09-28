import Paragraph from '@yoopta/paragraph';
import Blockquote from '@yoopta/blockquote';
import Table from '@yoopta/table';
import Divider from '@yoopta/divider';
import Accordion from '@yoopta/accordion';
import Code from '@yoopta/code';
import Embed from '@yoopta/embed';
import Link from '@yoopta/link';
import Callout from '@yoopta/callout';
import { NumberedList, BulletedList, TodoList } from '@yoopta/lists';
import { HeadingOne, HeadingTwo, HeadingThree } from '@yoopta/headings';
import LinkTool, { DefaultLinkToolRender } from '@yoopta/link-tool';
import Toolbar, { DefaultToolbarRender } from '@yoopta/toolbar';
import ActionMenu, { DefaultActionMenuRender } from '@yoopta/action-menu-list';
import { Bold, Italic, CodeMark, Underline, Strike, Highlight } from '@yoopta/marks';

export const tools = {
  Toolbar: {
    tool: Toolbar,
    render: DefaultToolbarRender,
  },
  ActionMenu: {
    tool: ActionMenu,
    render: DefaultActionMenuRender,
  },
  LinkTool: {
    tool: LinkTool,
    render: DefaultLinkToolRender,
  },
};

export const plugins = [
  Paragraph,
  Blockquote,
  Table,
  Divider,
  Accordion,
  Code,
  Embed,
  Link,
  Callout,
  HeadingOne,
  HeadingTwo,
  HeadingThree,
  NumberedList,
  BulletedList,
  TodoList,
];

export const marks = [Bold, Italic, CodeMark, Underline, Strike, Highlight];
