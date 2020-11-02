import ReactDOM from 'react-dom';


export const qiankun = {
  // 应用加载之前
  async bootstrap(props) {
    console.log('app1 bootstrap1', props);
  },
  // 应用 render 之前触发
  async mount(props) {
    console.log('app1 mount1', props);
  },
  // 应用卸载之后触发
  async unmount(props) {
    console.log('app1 unmount1', props);
    ReactDOM.unmountComponentAtNode(document.querySelector('#root-slave'));
  },
};
