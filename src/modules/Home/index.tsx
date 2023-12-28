import data from '../../data.json'
import {Modal, Image, Button, Space, Input, InputNumber} from "antd";
import {useEffect, useState} from "react";

interface IImgItem {
  srcImg: string
  targetImg: string
  maskImg: string
  status?: any
}

interface IDirItem {
  dirName: string
  images: IImgItem[]
}

const STATUSMap = {
  imgOk: 'ok',
  edgeFix: 'fixEdge',
  areaFix: 'fixArea',
  rerun: 'rerun',
  fail: 'totalFail',
  back: "backImg"
}

/**
 * 标记状态
 * 1. 【通过】，比较完美
 * 2. 【边缘简修】，整体比较完美，边缘有点毛刺，一般只要抹掉毛刺就好
 * 3. 【局部修复】 蒙版多包含了一部分，需要局部修复一下
 * 4. 【美工重做】 1. ai画图跟原图的变化不大 2. 画的完全不对
 * 5. 【ai重画】 蒙版还可以，但是图的姿势怪异、整体不协调
 * 6. 【背面图】 背面图统一要重做
 *
 *
 */


const STATUS = [
  {name: '通过', status: STATUSMap.imgOk},
  {name: '边缘简修', status: STATUSMap.edgeFix},
  {name: '局部修复', status: STATUSMap.areaFix},
  {name: '美工重做', status: STATUSMap.fail},
  {name: 'ai重画', status: STATUSMap.rerun},
  {name: '背面图', status: STATUSMap.back},
]
export default function Home() {
  const [open, setOpen] = useState<boolean>(false)
  const [info, setInfo] = useState<any>({});
  
  // const [arr] = useState(JSON.parse(JSON.stringify(data)));
  const [arr] = useState<IDirItem[]>(JSON.parse(localStorage.getItem('HANDLED') || JSON.stringify(data)));
  const [ready, setReady] = useState(false);
  
  const [taskCount, setTaskCount] = useState<number>(3)
  
  useEffect(() => {
    if (ready && !open) {
      localStorage.setItem("HANDLED", JSON.stringify(arr))
    }
    setReady(true);
  }, [arr, open]);
  
  const download = () => {
    // arr.find(item=>)
    const result: Record<string, string[]> = {};
    arr.forEach(dir => {
      dir.images.forEach(imgItem => {
        const label = STATUS.find(item => item.status === imgItem.status)
        if (label && label.status !== STATUSMap.imgOk) {
          result[label.name] ||= [];
          result[label.name].push(imgItem.srcImg)
        }
        
      })
    })
    saveToJson(result, 'result.json')
  }
  
  function RenderArr(data: IDirItem[]) {
    return (
      <div style={{display: 'flex', gap: '20px', flexWrap: 'wrap', marginBottom: '20px'}}>
        {data.map(item => {
          const fullHandled = item.images.every((item: any) => !!item.status);
          const partialHandled = item.images.some((item: any) => !!item.status);
          return (
            <div style={{padding: '8px', background: fullHandled ? '#0f9' : partialHandled ? '#f00' : '#999', color: "#fff"}} key={item.dirName} onClick={() => {
              setInfo(item)
              setOpen(true)
            }}>{item.dirName}</div>
          )
        })}
        <div>总共：{data.length}</div>
      </div>
    )
  }
  
  const total = arr.length;
  const each = Math.floor((total / (taskCount > 0 ? taskCount : 1)));
  
  
  return (
    <>
      <Space style={{marginBottom: '24px'}}>
        <InputNumber defaultValue={taskCount}
                     onBlur={(e) => setTaskCount(+e.target.value)}/>
        <Button onClick={async () => {
          await openConfirmBox('一般重新处理的时候才需要清除缓存')
          localStorage.setItem("HANDLED", '')
          location.reload();
        }}>清除缓存</Button>
        <Button onClick={download}>下载挑选结果</Button>
        <span>所有文件夹数：{arr.length}</span>
      </Space>
      {new Array(taskCount).fill({}).map((item: any, index) => RenderArr(arr.slice(index * each, (index + 1) * each)))}
      {open && <PreviewModal open={open} setOpen={setOpen} info={info}/>}
    </>
  
  )
}

function PreviewModal(props: any) {
  const {open, setOpen, info} = props;
  const [count, setCount] = useState<number>(0)
  return (
    <Modal onOk={() => setOpen(false)} width={1200} title={'预览'} open={open} onCancel={() => setOpen(false)}>
      <div className={'flex gap-8'} key={count}>
        {info.images?.map((item: any) => (
          <div key={item.srcImg}>
            <div>{item.srcImg}</div>
            <div className={'flex gap-8'}>
              <Image preview width={350} src={item.srcImg}/>
              <Image width={350} src={item.targetImg}/>
              <Image width={350} src={item.maskImg}/>
              <Space>
                {STATUS.map(statusItem => (
                  <Button type={statusItem.status === item.status ? 'primary' : undefined} onClick={() => {
                    item.status = statusItem.status
                    setCount(prevState => prevState + 1)
                  }} key={statusItem.status}>{statusItem.name}</Button>
                ))}
              </Space>
            </div>
          </div>
        ))}
      </div>
    </Modal>
  )
}


function openConfirmBox(content: string, title?: string, configs?: any) {
  return new Promise((resolve, reject) => {
    Modal.confirm({
      title: title || '确认',
      content,
      onOk: () => {
        resolve(true);
      },
      onCancel: () => {
        reject('cancel')
      },
      ...configs,
    })
  })
}

function saveToJson(obj: any, name?: string) {
  const blob = new Blob([JSON.stringify(obj, null, 2)], {type: 'application/json'});
  const url = URL.createObjectURL(blob);
  
  const a = document.createElement('a');
  a.href = url;
  a.download = name || 'data.json';
  a.click();
  
  URL.revokeObjectURL(url); // 释放 URL 对象
}