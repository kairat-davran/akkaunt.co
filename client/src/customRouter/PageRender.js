import React from 'react'
import { useParams } from 'react-router-dom'
import NotFound from '../components/NotFound'
import { useSelector } from 'react-redux'

const generatePage = (pageName) => {
  const component = () => require(`../pages/${pageName}`).default
  try {
      return React.createElement(component())
  } catch (error) {
      return <NotFound />
  }
}

const PageRender = () => {
  const { page, subpage, id } = useParams();
  const auth = useSelector(state => state.auth);

  if (!auth.token) return null;

  let pageName = '';

  if (page && subpage && id) {
    pageName = `${page}/${subpage}/[id]`;
  } else if (page && subpage) {
    pageName = `${page}/${subpage}`;
  } else if (page && id) {
    pageName = `${page}/[id]`;
  } else if (page) {
    pageName = page;
  }

  return generatePage(pageName);
};

export default PageRender