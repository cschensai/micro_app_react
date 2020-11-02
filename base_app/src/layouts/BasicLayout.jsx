/**
 * Ant Design Pro v4 use `@ant-design/pro-layout` to handle Layout.
 * You can view component api by:
 * https://github.com/ant-design/ant-design-pro-layout
 */
import ProLayout, { DefaultFooter } from '@ant-design/pro-layout';
import React, { useEffect, useMemo, useRef } from 'react';
import { Link, useIntl, connect, history } from 'umi';
import { GithubOutlined } from '@ant-design/icons';
import { Result, Button } from 'antd';
import Authorized from '@/utils/Authorized';
import RightContent from '@/components/GlobalHeader/RightContent';
import { getMatchMenu } from '@umijs/route-utils';
import { registerMicroApps, start } from 'qiankun';
import logo from '../assets/logo.svg';
const noMatch = (
  <Result
    status={403}
    title="403"
    subTitle="Sorry, you are not authorized to access this page."
    extra={
      <Button type="primary">
        <Link to="/user/login">Go Login</Link>
      </Button>
    }
  />
);

/**
 * use Authorized check all menu item
 */
// const menuDataRender = (menuList) =>
//   menuList.map((item) => {
//     const localItem = {
//       ...item,
//       children: item.children ? menuDataRender(item.children) : undefined,
//     };
//     return Authorized.check(item.authority, localItem, null);
//   });

const menuDataRender = () =>{
  return [
    { path: '/welcome', name: 'main' },
    { path: '/microApp1', name: 'sub1' },
    { path: '/microApp2', name: 'sub2' },
  ]
}

const defaultFooterDom = (
  <DefaultFooter
    copyright={`${new Date().getFullYear()} 蚂蚁集团体验技术部出品`}
    links={[
      {
        key: 'Ant Design Pro',
        title: 'Ant Design Pro',
        href: 'https://pro.ant.design',
        blankTarget: true,
      },
      {
        key: 'github',
        title: <GithubOutlined />,
        href: 'https://github.com/ant-design/ant-design-pro',
        blankTarget: true,
      },
      {
        key: 'Ant Design',
        title: 'Ant Design',
        href: 'https://ant.design',
        blankTarget: true,
      },
    ]}
  />
);

const BasicLayout = (props) => {
  const {
    dispatch,
    children,
    settings,
    location = {
      pathname: '/',
    },
    currentUser,
  } = props;
  const menuDataRef = useRef([]);
  useEffect(() => {
    if (dispatch) {
      dispatch({
        type: 'user/fetchCurrent',
      })
    }
  }, []);
  useEffect(() => {
    if (currentUser.userid) {
      // 注册微应用
      registerMicroApps([{
        name: 'app1',
        entry: '//localhost:7100',
        container: '#sub1box',
        activeRule: '/microApp1',
        props: {
          userInfo: currentUser
        },
      }, {
        name: 'app2',
        entry: '//localhost:7200',
        container: '#sub2box',
        activeRule: '/microApp2',
        props: {
          userInfo: currentUser,
        },
      }], {
        beforeMount: app => {
          console.log('app3', app);
        },
      });

      // 开启加载子应用
      start({
        // 是否预加载
        prefetch: true,
        // 是否开启沙箱模式
        sandbox: true,
      });
    }
    // TODO: 登录过期处理
  }, [currentUser])

  const handleMenuCollapse = (payload) => {
    if (dispatch) {
      dispatch({
        type: 'global/changeLayoutCollapsed',
        payload,
      });
    }
  }; // get children authority

  const authorized = useMemo(
    () =>
      getMatchMenu(location.pathname || '/', menuDataRef.current).pop() || {
        authority: undefined,
      },
    [location.pathname],
  );
  const { formatMessage } = useIntl();
  return (
    <ProLayout
      logo={logo}
      formatMessage={formatMessage}
      onCollapse={handleMenuCollapse}
      onMenuHeaderClick={() => history.push('/')}
      menuItemRender={(menuItemProps, defaultDom) => {
        if (menuItemProps.isUrl || !menuItemProps.path) {
          return defaultDom;
        }

        return <Link to={menuItemProps.path}>{defaultDom}</Link>;
      }}
      breadcrumbRender={(routers = []) => [
        {
          path: '/',
          breadcrumbName: formatMessage({
            id: 'menu.home',
          }),
        },
        ...routers,
      ]}
      itemRender={(route, params, routes, paths) => {
        const first = routes.indexOf(route) === 0;
        return first ? (
          <Link to={paths.join('/')}>{route.breadcrumbName}</Link>
        ) : (
          <span>{route.breadcrumbName}</span>
        );
      }}
      // footerRender={() => defaultFooterDom}
      menuDataRender={menuDataRender}
      rightContentRender={() => <RightContent />}
      postMenuData={(menuData) => {
        menuDataRef.current = menuData || [];
        return menuData || [];
      }}
      {...props}
      {...settings}
    >
      <Authorized authority={authorized.authority} noMatch={noMatch}>
        {children}
        <div id="sub1box"></div>
        <div id="sub2box"></div>
      </Authorized>
    </ProLayout>
  );
};

export default connect(({ global, settings, user }) => ({
  collapsed: global.collapsed,
  settings,
  currentUser: user.currentUser,
}))(BasicLayout);
