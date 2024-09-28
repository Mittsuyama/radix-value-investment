import { memo, useState } from 'react';
import { Card, Text, Spinner, Link, Tooltip } from '@radix-ui/themes';
import { get, makeSureiIsArray } from '@renderer/api/request';
import { useAsyncEffect } from 'ahooks';

interface NoticeItem {
  title: string;
  code: string;
  date: string;
}

export const fetchPdfUrl = async (article: string) => {
  const url = 'https://np-cnotice-stock.eastmoney.com/api/content/ann';
  const res = await get(url, {
    art_code: `${article}`,
    client_source: 'web',
    page_index: '1',
  });
  return res.data.attach_url;
};

export const getNoticeList = async (code: string) => {
  const res = await get('https://np-anotice-stock.eastmoney.com/api/security/ann', {
    sr: '-1',
    page_size: '200',
    page_index: '1',
    ann_type: 'A',
    stock_list: `${code}`,
    f_node: '1',
    s_node: '1',
  });
  return makeSureiIsArray(res.data.list).map<NoticeItem>((item) => ({
    title: item.title,
    code: item.art_code,
    date: item.notice_date,
  }));
};

interface NoticeProps {
  code: string;
}

const getNoticeYear = (title: string) => {
  const year = title.match(/(?<![0-9])[0-9]{4}(?![0-9])/)?.[0];
  return Number(year) || 1970;
};

const noticeTitleRender = (title: string) => {
  const year = getNoticeYear(title);
  const [pre, suf] = title.split(`${year}年`);

  const contentRender = () => {
    return (
      <div className="overflow-hidden text-ellipsis whitespace-nowrap">
        <span className="mx-1 font-bold font-mono">{year}年</span>
        <span>{suf}</span>
        {year === 1970 ? <span>{pre}</span> : null}
      </div>
    );
  };

  if ((year + suf + (year === 1970 ? pre : '')).length > 20) {
    return <Tooltip content={title}>{contentRender()}</Tooltip>;
  }
  return contentRender();
};

export const Notice = memo<NoticeProps>(({ code }) => {
  const [list, setList] = useState<NoticeItem[] | null>(null);

  useAsyncEffect(async () => {
    const res = await getNoticeList(code);
    setList(
      res
        .sort((a, b) => getNoticeYear(b.title) - getNoticeYear(a.title))
        .filter((item) => {
          const words = ['摘要', '财务', '英文', '正文'];
          if (words.some((word) => item.title.includes(word))) {
            return false;
          }
          return true;
        }),
    );
  }, [code]);

  if (!list) {
    return (
      <Card className="h-full flex flex-col">
        <div className="w-full h-full flex flex-col px-2">
          <Text size="3" className="font-bold mb-2">
            Notices
          </Text>
          <div className="w-full flex-1 flex justify-center items-center">
            <Spinner />
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card className="h-full flex flex-col">
      <div className="w-full h-full flex flex-col px-2">
        <Text size="3" className="font-bold mb-2">
          Notices
        </Text>
        <div className="w-full flex-1 overflow-auto pt-2 pr-2 pb-2">
          {list.map((item) => (
            <div
              key={item.code}
              className="text-ellipsis overflow-hidden whitespace-nowrap text-sm"
            >
              <Link
                key={item.code}
                href="#"
                onClick={async (e) => {
                  e.stopPropagation();
                  e.preventDefault();
                  const url = await fetchPdfUrl(item.code);
                  window.open(url);
                }}
              >
                <div className="flex items-center">
                  <div className="flex flex-1 overflow-hidden">{noticeTitleRender(item.title)}</div>
                  <div className="flex-none ml-1 font-mono">({item.date.split(' ')[0]})</div>
                </div>
              </Link>
            </div>
          ))}
        </div>
      </div>
    </Card>
  );
});
Notice.displayName = 'Notice';
